import React, { useState, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AlertTriangle, Car, DollarSign, Package, ChevronDown, ChevronUp, Trash2, LogOut } from 'lucide-react-native';
import { useShopData } from '@/hooks/useShopData';
import { useAuth } from '@/hooks/useAuth';
import { formatVND, formatNumber } from '@/utils/currency';
import { Part } from '@/types';
import { DateRangeFilter } from '@/components/DateRangeFilter';

export default function DashboardScreen() {
  const { parts, vehicles, services, clearAllData, resetToSampleData } = useShopData();
  const { logout, user } = useAuth();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  
  const handleClearData = () => {
    clearAllData();
  };
  
  const handleLoadSampleData = () => {
    resetToSampleData();
  };
  
  const handleLogout = async () => {
    await logout();
  };
  
  // Group parts by name and calculate available stock (total inventory - used in services)
  const groupedParts = useMemo(() => {
    // First, calculate how much of each part has been used in services
    const usedParts = services.reduce((acc, service) => {
      service.parts.forEach(servicePart => {
        const key = servicePart.partName.toLowerCase();
        acc[key] = (acc[key] || 0) + servicePart.quantity;
      });
      return acc;
    }, {} as Record<string, number>);

    // Then group parts by name and calculate available stock
    const grouped = parts.reduce((acc, part) => {
      const key = part.name.toLowerCase();
      const usedQuantity = usedParts[key] || 0;
      
      if (acc[key]) {
        const totalInventory = acc[key].originalStockQuantity + part.stockQuantity;
        const availableStock = Math.max(0, totalInventory - usedQuantity);
        
        acc[key] = {
          ...acc[key],
          originalStockQuantity: totalInventory,
          stockQuantity: availableStock,
          totalValue: acc[key].totalValue + (part.price * part.originalQuantity),
          entries: acc[key].entries + 1,
        };
      } else {
        const availableStock = Math.max(0, part.stockQuantity - usedQuantity);
        
        acc[key] = {
          ...part,
          originalStockQuantity: part.stockQuantity,
          stockQuantity: availableStock,
          totalValue: part.price * part.originalQuantity,
          entries: 1,
        };
      }
      return acc;
    }, {} as Record<string, Part & { totalValue: number; entries: number; originalStockQuantity: number }>);
    
    return Object.values(grouped);
  }, [parts, services]);
  
  // Update low stock calculation to use grouped parts
  const groupedLowStockParts = useMemo(() => {
    return groupedParts.filter(part => part.stockQuantity <= part.minStockLevel);
  }, [groupedParts]);
  const insets = useSafeAreaInsets();
  const [isLowStockExpanded, setIsLowStockExpanded] = useState(false);
  const [isPartsExpanded, setIsPartsExpanded] = useState(false);
  
  const lowStockParts = groupedLowStockParts;
  // Filter services by date range
  const filteredServices = useMemo(() => {
    if (!startDate && !endDate) return services;
    
    return services.filter(service => {
      const serviceDate = new Date(service.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if (start && serviceDate < start) return false;
      if (end && serviceDate > end) return false;
      return true;
    });
  }, [services, startDate, endDate]);
  
  const recentServices = filteredServices.slice(-5).reverse();
  const completedServices = filteredServices.filter(s => s.status === 'completed').length;
  
  // Calculate total parts revenue (revenue from parts actually sold/used in services)
  const totalPartsRevenue = useMemo(() => {
    // Calculate revenue directly from service parts (which already have the correct selling price)
    const total = filteredServices.reduce((sum, service) => {
      const servicePartsRevenue = service.parts.reduce((partSum, part) => {
        console.log(`Service ${service.id} - Part ${part.partName}: qty=${part.quantity}, unitPrice=${part.unitPrice}, totalPrice=${part.totalPrice}`);
        return partSum + part.totalPrice;
      }, 0);
      console.log(`Service ${service.id} total parts revenue: ${servicePartsRevenue}`);
      return sum + servicePartsRevenue;
    }, 0);
    console.log(`Total parts revenue across all services: ${total}`);
    return total;
  }, [filteredServices]);
  
  // Calculate total parts cost (cost of all parts in inventory)
  const totalPartsCost = useMemo(() => {
    return groupedParts.reduce((sum, part) => {
      return sum + (part.cost * part.originalStockQuantity);
    }, 0);
  }, [groupedParts]);
  
  // Calculate total labor revenue
  const totalLaborRevenue = useMemo(() => {
    return filteredServices.reduce((sum, service) => {
      return sum + (service.laborHours * service.laborRate);
    }, 0);
  }, [filteredServices]);
  
  // Calculate total service revenue (parts revenue + labor revenue)
  const totalServiceRevenue = useMemo(() => {
    return totalPartsRevenue + totalLaborRevenue;
  }, [totalPartsRevenue, totalLaborRevenue]);

  const StatCard = ({ icon, title, value, subtitle, color = "#2563eb", onPress }: {
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle?: string;
    color?: string;
    onPress?: () => void;
  }) => {
    const CardComponent = onPress ? TouchableOpacity : View;
    return (
      <CardComponent style={styles.statCard} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
        <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
          {React.cloneElement(icon as React.ReactElement, { color, size: 24 } as any)}
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
      </CardComponent>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Dashboard</Text>
              <Text style={styles.subtitle}>Welcome back, {user?.name || 'User'}</Text>
            </View>
            <View style={styles.headerButtonsContainer}>
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <LogOut size={18} color="#2563eb" />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={handleClearData}
                activeOpacity={0.7}
              >
                <Trash2 size={18} color="#ef4444" />
                <Text style={styles.clearButtonText}>Clear Data</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.sampleDataButton}
                onPress={handleLoadSampleData}
                activeOpacity={0.7}
              >
                <Package size={18} color="#10b981" />
                <Text style={styles.sampleDataButtonText}>Load Sample</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
        />

        <View style={styles.statsGrid}>
          <StatCard
            icon={<DollarSign />}
            title="Service Revenue"
            value={formatVND(totalServiceRevenue)}
            subtitle="All time"
            color="#10b981"
          />
          <StatCard
            icon={<Car />}
            title="Vehicles"
            value={vehicles.length.toString()}
            subtitle="In database"
          />
          <StatCard
            icon={<Package />}
            title="Parts"
            value={groupedParts.length.toString()}
            subtitle="Unique items"
            onPress={() => setIsPartsExpanded(!isPartsExpanded)}
          />
          <StatCard
            icon={<AlertTriangle />}
            title="Low Stock"
            value={lowStockParts.length.toString()}
            subtitle="Parts need reorder"
            color="#ef4444"
          />
        </View>

        {isPartsExpanded && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setIsPartsExpanded(!isPartsExpanded)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>All Parts in Stock</Text>
              <View style={styles.expandButton}>
                <Text style={styles.partsCount}>{groupedParts.length}</Text>
                {isPartsExpanded ? (
                  <ChevronUp size={20} color="#64748b" />
                ) : (
                  <ChevronDown size={20} color="#64748b" />
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.card}>
              {groupedParts.map((part) => (
                <View key={part.id} style={styles.partItem}>
                  <View style={styles.partIcon}>
                    <Package size={16} color="#2563eb" />
                  </View>
                  <View style={styles.partContent}>
                    <Text style={styles.partTitle}>{part.name}</Text>
                    <Text style={styles.partSubtitle}>
                      Available: {formatNumber(part.stockQuantity)} • Total Added: {formatNumber(part.originalStockQuantity)} • Part #: {part.partNumber}
                    </Text>
                    <Text style={styles.partPrice}>
                      Unit: {formatVND(part.price)} • Total Value: {formatVND(part.totalValue)}
                    </Text>
                    {part.entries > 1 && (
                      <Text style={styles.partEntriesText}>
                        Combined from {part.entries} inventory entries
                      </Text>
                    )}
                    {part.description && (
                      <Text style={styles.partDescription}>{part.description}</Text>
                    )}
                  </View>
                  <View style={[styles.stockBadge, {
                    backgroundColor: part.stockQuantity <= part.minStockLevel ? '#fef2f2' : '#f0fdf4',
                    borderColor: part.stockQuantity <= part.minStockLevel ? '#fecaca' : '#bbf7d0'
                  }]}>
                    <Text style={[styles.stockBadgeText, {
                      color: part.stockQuantity <= part.minStockLevel ? '#ef4444' : '#16a34a'
                    }]}>
                      {part.stockQuantity <= part.minStockLevel ? 'LOW' : 'OK'}
                    </Text>
                  </View>
                </View>
              ))}
              {groupedParts.length === 0 && (
                <Text style={styles.emptyText}>No parts in inventory</Text>
              )}
            </View>
          </View>
        )}

        {lowStockParts.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setIsLowStockExpanded(!isLowStockExpanded)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
              <View style={styles.expandButton}>
                <Text style={styles.alertCount}>{lowStockParts.length}</Text>
                {isLowStockExpanded ? (
                  <ChevronUp size={20} color="#64748b" />
                ) : (
                  <ChevronDown size={20} color="#64748b" />
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.card}>
              {(isLowStockExpanded ? lowStockParts : lowStockParts.slice(0, 3)).map((part) => (
                <View key={part.id} style={styles.alertItem}>
                  <View style={styles.alertIcon}>
                    <AlertTriangle size={16} color="#ef4444" />
                  </View>
                  <View style={styles.alertContent}>
                    <Text style={styles.alertTitle}>{part.name}</Text>
                    <Text style={styles.alertSubtitle}>
                      Available: {formatNumber(part.stockQuantity)} • Total Added: {formatNumber(part.originalStockQuantity)} (Min: {formatNumber(part.minStockLevel)})
                    </Text>
                    <Text style={styles.alertPrice}>
                      Total Value: {formatVND(part.totalValue)}
                    </Text>
                    {part.entries > 1 && (
                      <Text style={styles.alertEntriesText}>
                        {part.entries} inventory entries
                      </Text>
                    )}
                  </View>
                  <View style={styles.alertBadge}>
                    <Text style={styles.alertBadgeText}>
                      {part.stockQuantity === 0 ? 'OUT' : 'LOW'}
                    </Text>
                  </View>
                </View>
              ))}
              {!isLowStockExpanded && lowStockParts.length > 3 && (
                <TouchableOpacity 
                  style={styles.showMoreButton}
                  onPress={() => setIsLowStockExpanded(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.showMoreText}>
                    Show {lowStockParts.length - 3} more parts
                  </Text>
                  <ChevronDown size={16} color="#2563eb" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Services</Text>
          <View style={styles.card}>
            {recentServices.length > 0 ? (
              recentServices.map((service) => {
                const vehicle = vehicles.find(v => v.id === service.vehicleId);
                return (
                  <View key={service.id} style={styles.serviceItem}>
                    <View style={styles.serviceHeader}>
                      <Text style={styles.serviceName}>
                        {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}
                      </Text>
                      <Text style={styles.serviceAmount}>{formatVND(service.totalCost)}</Text>
                    </View>
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                    <Text style={styles.serviceDate}>
                      {new Date(service.date).toLocaleDateString()}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No services recorded yet</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.card}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatLabel}>Completed Services</Text>
              <Text style={styles.quickStatValue}>{completedServices}</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatLabel}>Average Service Value</Text>
              <Text style={styles.quickStatValue}>
                {filteredServices.length > 0 ? formatVND(totalServiceRevenue / filteredServices.length) : formatVND(0)}
              </Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatLabel}>Total Parts Revenue</Text>
              <Text style={styles.quickStatValue}>
                {formatVND(totalPartsRevenue)}
              </Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatLabel}>Total Parts Cost</Text>
              <Text style={styles.quickStatValue}>
                {formatVND(totalPartsCost)}
              </Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatLabel}>Total Labor Revenue</Text>
              <Text style={styles.quickStatValue}>
                {formatVND(totalLaborRevenue)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerButtonsContainer: {
    flexDirection: 'column',
    gap: 8,
    alignItems: 'flex-end',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    gap: 6,
  },
  logoutButtonText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 6,
  },
  clearButtonText: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '600',
    flexShrink: 1,
  },
  sampleDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    gap: 6,
  },
  sampleDataButtonText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  statSubtitle: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  alertSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  moreText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  serviceItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  serviceAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  serviceDescription: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  serviceDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  quickStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  quickStatLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  quickStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  alertPrice: {
    fontSize: 11,
    color: '#10b981',
    marginTop: 2,
    fontWeight: '500',
  },
  alertBadge: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  alertBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 4,
  },
  showMoreText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  partsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  partItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  partIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  partContent: {
    flex: 1,
  },
  partTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  partSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  partPrice: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '500',
    marginBottom: 2,
  },
  partDescription: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 2,
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  partEntriesText: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '500',
    marginBottom: 2,
    fontStyle: 'italic',
  },
  alertEntriesText: {
    fontSize: 10,
    color: '#2563eb',
    fontWeight: '500',
    marginTop: 2,
    fontStyle: 'italic',
  },
});