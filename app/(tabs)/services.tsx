import React, { useState, useCallback, memo, useMemo } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Plus, Search, Wrench, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useShopData } from '@/hooks/useShopData';
import { ServiceRecord, ServicePart, Vehicle } from '@/types';
import { formatVND } from '@/utils/currency';
import { DateRangeFilter } from '@/components/DateRangeFilter';

interface VehicleSearchDropdownProps {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onSelectVehicle: (vehicleId: string) => void;
}

const VehicleSearchDropdown = memo(({ vehicles, selectedVehicleId, onSelectVehicle }: VehicleSearchDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  
  const filteredVehicles = vehicles.filter(vehicle => {
    const searchText = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.customerName} ${vehicle.licensePlate}`.toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });
  
  const handleSelectVehicle = useCallback((vehicleId: string) => {
    onSelectVehicle(vehicleId);
    setIsOpen(false);
    setSearchQuery('');
  }, [onSelectVehicle]);
  
  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>Select Vehicle:</Text>
      
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={[
          styles.dropdownButtonText,
          !selectedVehicle && styles.dropdownPlaceholder
        ]}>
          {selectedVehicle 
            ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model} - ${selectedVehicle.customerName}`
            : 'Select a vehicle...'
          }
        </Text>
        {isOpen ? (
          <ChevronUp size={20} color="#64748b" />
        ) : (
          <ChevronDown size={20} color="#64748b" />
        )}
      </TouchableOpacity>
      
      {isOpen && (
        <View style={styles.dropdownContent}>
          <View style={styles.dropdownSearchContainer}>
            <Search size={16} color="#64748b" style={styles.dropdownSearchIcon} />
            <TextInput
              style={styles.dropdownSearchInput}
              placeholder="Search vehicles..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <ScrollView 
            style={styles.vehicleList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[
                    styles.vehicleItem,
                    selectedVehicleId === vehicle.id && styles.selectedVehicleItem
                  ]}
                  onPress={() => handleSelectVehicle(vehicle.id)}
                >
                  <View style={styles.vehicleItemContent}>
                    <Text style={styles.vehicleItemTitle}>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </Text>
                    <Text style={styles.vehicleItemSubtitle}>
                      {vehicle.customerName}
                    </Text>
                    <Text style={styles.vehicleItemDetails}>
                      {vehicle.licensePlate} • {vehicle.vin}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No vehicles found</Text>
                <Text style={styles.noResultsSubtext}>Try adjusting your search</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
});
VehicleSearchDropdown.displayName = 'VehicleSearchDropdown';

interface AddServiceFormProps {
  newService: Partial<ServiceRecord>;
  vehicles: Vehicle[];
  onUpdateField: (field: keyof ServiceRecord, value: string | number | ServicePart[]) => void;
  onSave: () => void;
  onCancel: () => void;
}

const AddServiceForm = memo(({ newService, vehicles, onUpdateField, onSave, onCancel }: AddServiceFormProps) => {
  const { parts, services } = useShopData();
  const [selectedParts, setSelectedParts] = useState<ServicePart[]>(newService.parts || []);
  
  const handleVehicleSelect = useCallback((vehicleId: string) => {
    onUpdateField('vehicleId', vehicleId);
  }, [onUpdateField]);
  
  const handleDateChange = useCallback((text: string) => onUpdateField('date', text), [onUpdateField]);
  const handleOdometerChange = useCallback((text: string) => onUpdateField('odometer', text), [onUpdateField]);
  const handleDescriptionChange = useCallback((text: string) => onUpdateField('description', text), [onUpdateField]);
  const handleLaborHoursChange = useCallback((text: string) => onUpdateField('laborHours', text), [onUpdateField]);
  const handleLaborRateChange = useCallback((text: string) => onUpdateField('laborRate', text), [onUpdateField]);
  const handleNotesChange = useCallback((text: string) => onUpdateField('notes', text), [onUpdateField]);
  
  const addPart = useCallback((partId: string) => {
    const part = parts.find(p => p.id === partId);
    if (part) {
      const newPart: ServicePart = {
        partId: part.id,
        partName: part.name,
        quantity: 1,
        unitPrice: part.price,
        totalPrice: part.price,
      };
      const updatedParts = [...selectedParts, newPart];
      setSelectedParts(updatedParts);
      onUpdateField('parts', updatedParts);
    }
  }, [parts, selectedParts, onUpdateField]);
  
  const updatePartQuantity = useCallback((index: number, quantity: number) => {
    const updatedParts = selectedParts.map((part, i) => 
      i === index ? { ...part, quantity, totalPrice: part.unitPrice * quantity } : part
    );
    setSelectedParts(updatedParts);
    onUpdateField('parts', updatedParts);
  }, [selectedParts, onUpdateField]);
  
  const removePart = useCallback((index: number) => {
    const updatedParts = selectedParts.filter((_, i) => i !== index);
    setSelectedParts(updatedParts);
    onUpdateField('parts', updatedParts);
  }, [selectedParts, onUpdateField]);

  return (
    <View style={styles.addForm}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.formContent}
      >
      <Text style={styles.addFormTitle}>Add New Service</Text>
      
      <VehicleSearchDropdown
        vehicles={vehicles}
        selectedVehicleId={newService.vehicleId || ''}
        onSelectVehicle={handleVehicleSelect}
      />
      
      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Service Date</Text>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#64748b"
            value={newService.date || ''}
            onChangeText={handleDateChange}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Odometer (km)</Text>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="e.g. 125000"
            placeholderTextColor="#64748b"
            value={typeof newService.odometer === 'string' ? newService.odometer : (newService.odometer?.toString() || '')}
            onChangeText={handleOdometerChange}
            keyboardType="numeric"
          />
        </View>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Service Description</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Oil change, brake repair, tire rotation"
          placeholderTextColor="#64748b"
          value={newService.description || ''}
          onChangeText={handleDescriptionChange}
          multiline
        />
      </View>
      
      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Labor Hours</Text>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="e.g. 2.5"
            placeholderTextColor="#64748b"
            value={typeof newService.laborHours === 'string' ? newService.laborHours : (newService.laborHours?.toString() || '')}
            onChangeText={handleLaborHoursChange}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Labor Rate (VND/hour)</Text>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="e.g. 100000"
            placeholderTextColor="#64748b"
            value={typeof newService.laborRate === 'string' ? newService.laborRate : (newService.laborRate?.toString() || '')}
            onChangeText={handleLaborRateChange}
            keyboardType="numeric"
          />
        </View>
      </View>
      
      <View style={styles.partsContainer}>
        <Text style={styles.inputLabel}>Parts Used</Text>
        
        <View style={styles.addPartSection}>
          <Text style={styles.addPartLabel}>Add Parts:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.partsScrollView}>
            {parts
              .filter(part => !selectedParts.some(sp => sp.partId === part.id))
              .reduce((uniqueParts, part) => {
                // Group by part name to avoid duplicates
                const existingPart = uniqueParts.find(p => p.name.toLowerCase() === part.name.toLowerCase());
                if (!existingPart) {
                  uniqueParts.push(part);
                }
                return uniqueParts;
              }, [] as typeof parts)
              .map((part) => {
                // Calculate remaining available quantity for this part name
                const totalInventoryQuantity = parts
                  .filter(p => p.name.toLowerCase() === part.name.toLowerCase())
                  .reduce((sum, p) => sum + p.stockQuantity, 0);
                
                // Calculate total quantity used in all services
                const totalUsedQuantity = services
                  .flatMap((service: ServiceRecord) => service.parts || [])
                  .filter((servicePart: ServicePart) => servicePart.partName.toLowerCase() === part.name.toLowerCase())
                  .reduce((sum: number, servicePart: ServicePart) => sum + servicePart.quantity, 0);
                
                const remainingQuantity = totalInventoryQuantity - totalUsedQuantity;
                
                return (
                  <TouchableOpacity
                    key={part.id}
                    style={styles.partOption}
                    onPress={() => addPart(part.id)}
                  >
                    <Text style={styles.partOptionName}>{part.name}</Text>
                    <Text style={styles.partOptionQuantity}>Available: {remainingQuantity}</Text>
                    <Text style={styles.partOptionPrice}>Cost: {formatVND(part.cost)}</Text>
                    <Text style={styles.partOptionCost}>Sale: {formatVND(part.price)}</Text>
                  </TouchableOpacity>
                );
              })}
          </ScrollView>
        </View>
        
        {selectedParts.length > 0 && (
          <View style={styles.selectedPartsSection}>
            <Text style={styles.selectedPartsLabel}>Selected Parts:</Text>
            {selectedParts.map((part, index) => (
              <View key={`${part.partId}-${index}`} style={styles.selectedPartItem}>
                <View style={styles.selectedPartInfo}>
                  <Text style={styles.selectedPartName}>{part.partName}</Text>
                  <Text style={styles.selectedPartPrice}>{formatVND(part.unitPrice)} each</Text>
                </View>
                <View style={styles.partQuantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updatePartQuantity(index, Math.max(1, part.quantity - 1))}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{part.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updatePartQuantity(index, part.quantity + 1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.removePartButton}
                  onPress={() => removePart(index)}
                >
                  <Text style={styles.removePartText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.partsTotalContainer}>
              <Text style={styles.partsTotalText}>
                Parts Total: {formatVND(selectedParts.reduce((sum, part) => sum + part.totalPrice, 0))}
              </Text>
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Any additional information about the service"
          placeholderTextColor="#64748b"
          value={newService.notes || ''}
          onChangeText={handleNotesChange}
          multiline
        />
      </View>
      
      {/* Service Summary */}
      <View style={styles.serviceSummaryContainer}>
        <Text style={styles.serviceSummaryTitle}>Service Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Parts Total:</Text>
          <Text style={styles.summaryValue}>
            {formatVND(selectedParts.reduce((sum, part) => sum + part.totalPrice, 0))}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Labor Total:</Text>
          <Text style={styles.summaryValue}>
            {formatVND(
              (typeof newService.laborHours === 'string' ? parseFloat(newService.laborHours) || 0 : (newService.laborHours || 0)) *
              (typeof newService.laborRate === 'string' ? parseFloat(newService.laborRate) || 0 : (newService.laborRate || 0))
            )}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Revenue:</Text>
          <Text style={styles.totalValue}>
            {formatVND(
              selectedParts.reduce((sum, part) => sum + part.totalPrice, 0) +
              ((typeof newService.laborHours === 'string' ? parseFloat(newService.laborHours) || 0 : (newService.laborHours || 0)) *
               (typeof newService.laborRate === 'string' ? parseFloat(newService.laborRate) || 0 : (newService.laborRate || 0)))
            )}
          </Text>
        </View>
      </View>
      
      <View style={styles.formButtons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button, 
            styles.saveButton,
            (!newService.vehicleId || !newService.description?.trim()) && styles.disabledButton
          ]}
          onPress={onSave}
          disabled={!newService.vehicleId || !newService.description?.trim()}
        >
          <Text style={[
            styles.saveButtonText,
            (!newService.vehicleId || !newService.description?.trim()) && styles.disabledButtonText
          ]}>Add Service</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
});
AddServiceForm.displayName = 'AddServiceForm';

export default function ServicesScreen() {
  const { services, vehicles, addService, getVehicleById } = useShopData();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [newService, setNewService] = useState<Partial<ServiceRecord>>(() => {
    // Create today's date in Vietnam timezone (UTC+7)
    const now = new Date();
    const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const localDateString = vietnamTime.toISOString().split('T')[0];
    
    return {
      vehicleId: '',
      date: localDateString,
      odometer: 0,
      description: '',
      laborHours: 0,
      laborRate: 100000,
      parts: [],
      totalCost: 0,
      status: 'completed',
      notes: '',
    };
  });

  const filteredServices = useMemo(() => {
    let filtered = [...services];
    
    // Filter by date range
    if (startDate || endDate) {
      filtered = filtered.filter(service => {
        const serviceDate = new Date(service.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start && serviceDate < start) return false;
        if (end && serviceDate > end) return false;
        return true;
      });
    }
    
    // Filter by search query
    const searchFiltered = filtered.filter(service => {
      const vehicle = getVehicleById(service.vehicleId);
      const vehicleInfo = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : '';
      return (
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicleInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle?.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle?.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    
    // Sort by date (reverse chronological - newest first)
    return searchFiltered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [services, searchQuery, startDate, endDate, getVehicleById]);

  const handleAddService = useCallback(async () => {
    console.log('Add Service clicked', { vehicleId: newService.vehicleId, description: newService.description });
    
    if (!newService.vehicleId) {
      console.log('Missing vehicle selection');
      alert('Please select a vehicle');
      return;
    }
    
    if (!newService.description || newService.description.trim() === '') {
      console.log('Missing service description');
      alert('Please enter a service description');
      return;
    }
    
    try {
      const parsedLaborHours = typeof newService.laborHours === 'string' ? parseFloat(newService.laborHours) || 0 : (newService.laborHours || 0);
      const parsedLaborRate = typeof newService.laborRate === 'string' ? parseFloat(newService.laborRate) || 0 : (newService.laborRate || 0);
      const parsedOdometer = typeof newService.odometer === 'string' ? parseInt(newService.odometer) || 0 : (newService.odometer || 0);
      
      const laborCost = parsedLaborHours * parsedLaborRate;
      const partsCost = newService.parts?.reduce((sum, part) => sum + part.totalPrice, 0) || 0;
      const totalCost = laborCost + partsCost;

      console.log('Adding service with data:', {
        ...newService,
        odometer: parsedOdometer,
        laborHours: parsedLaborHours,
        laborRate: parsedLaborRate,
        totalCost,
        laborCost,
        partsCost
      });

      await addService({
        ...newService,
        odometer: parsedOdometer,
        laborHours: parsedLaborHours,
        laborRate: parsedLaborRate,
        totalCost,
      } as Omit<ServiceRecord, 'id' | 'createdAt' | 'updatedAt'>);
      
      // Create today's date in Vietnam timezone for reset
      const now = new Date();
      const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
      const localDateString = vietnamTime.toISOString().split('T')[0];
      
      setNewService({
        vehicleId: '',
        date: localDateString,
        odometer: 0,
        description: '',
        laborHours: 0,
        laborRate: 100000,
        parts: [],
        totalCost: 0,
        status: 'completed',
        notes: '',
      });
      setShowAddForm(false);
      console.log('Service added successfully');
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Error adding service. Please try again.');
    }
  }, [newService, addService]);

  const ServiceItem = memo(({ item }: { item: ServiceRecord }) => {
    const vehicle = getVehicleById(item.vehicleId);
    const statusColor = item.status === 'completed' ? '#10b981' : 
                       item.status === 'in-progress' ? '#f59e0b' : '#64748b';
    
    const laborRevenue = (item.laborHours || 0) * (item.laborRate || 0);
    const partsRevenue = item.parts.reduce((sum, part) => sum + part.totalPrice, 0);
    const totalRevenue = laborRevenue + partsRevenue;
    
    console.log(`Service ${item.id} revenue breakdown:`, {
      laborRevenue,
      partsRevenue,
      totalRevenue,
      parts: item.parts.map(p => ({ name: p.partName, qty: p.quantity, unitPrice: p.unitPrice, total: p.totalPrice }))
    });
    
    return (
      <View style={styles.serviceItem}>
        <View style={styles.serviceHeader}>
          <View style={styles.serviceIcon}>
            <Wrench size={20} color="#2563eb" />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>
              {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}
            </Text>
            <Text style={styles.customerName}>
              {vehicle?.customerName || 'Unknown Customer'}
            </Text>
            <Text style={styles.licensePlate}>
              {vehicle?.licensePlate || 'No License Plate'}
            </Text>
          </View>
          <View style={styles.serviceAmount}>
            <Text style={styles.totalCost}>{formatVND(totalRevenue)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status.replace('-', ' ')}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.serviceDetails}>
          <Text style={styles.serviceDescription}>{item.description}</Text>
          
          <View style={styles.serviceMeta}>
            <View style={styles.metaItem}>
              <Calendar size={12} color="#64748b" />
              <Text style={styles.metaText}>{new Date(item.date + 'T00:00:00').toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric'
              })}</Text>
            </View>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>{item.odometer.toLocaleString()} km</Text>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>{item.laborHours}hrs @ {formatVND(item.laborRate)}/hr = {formatVND(laborRevenue)}</Text>
          </View>
          
          {item.parts.length > 0 && (
            <View style={styles.partsSection}>
              <Text style={styles.partsTitle}>Parts Used:</Text>
              {item.parts.map((part) => (
                <Text key={`${part.partName}-${part.quantity}`} style={styles.partItem}>
                  • {part.partName} (Qty: {part.quantity}) - {formatVND(part.totalPrice)}
                </Text>
              ))}
            </View>
          )}
          
          {item.notes && (
            <Text style={styles.serviceNotes}>{item.notes}</Text>
          )}
        </View>
      </View>
    );
  });
  ServiceItem.displayName = 'ServiceItem';



  const updateServiceField = useCallback((field: keyof ServiceRecord, value: string | number | ServicePart[]) => {
    setNewService(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCancel = useCallback(() => {
    setShowAddForm(false);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Services</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Plus size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }}
      />

      <View style={styles.searchContainer}>
        <Search size={20} color="#64748b" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by vehicle, customer, license plate, or service..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {showAddForm && (
        <AddServiceForm
          newService={newService}
          vehicles={vehicles}
          onUpdateField={updateServiceField}
          onSave={handleAddService}
          onCancel={handleCancel}
        />
      )}

      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ServiceItem item={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No services found</Text>
            <Text style={styles.emptySubtext}>Add your first service record to get started</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addButton: {
    backgroundColor: '#2563eb',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  serviceItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  customerName: {
    fontSize: 12,
    color: '#64748b',
  },
  licensePlate: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '600',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  serviceAmount: {
    alignItems: 'flex-end',
  },
  totalCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  serviceDetails: {
    gap: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 18,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
  },
  partsSection: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 6,
  },
  partsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  partItem: {
    fontSize: 11,
    color: '#64748b',
    marginLeft: 8,
  },
  serviceNotes: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 6,
  },
  addForm: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    maxHeight: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  formContent: {
    padding: 16,
  },
  addFormTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    minHeight: 48,
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  dropdownPlaceholder: {
    color: '#64748b',
  },
  dropdownContent: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 300,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownSearchIcon: {
    marginRight: 8,
  },
  dropdownSearchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    paddingVertical: 4,
  },
  vehicleList: {
    maxHeight: 240,
  },
  vehicleItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectedVehicleItem: {
    backgroundColor: '#eff6ff',
  },
  vehicleItemContent: {
    gap: 2,
  },
  vehicleItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  vehicleItemSubtitle: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '500',
  },
  vehicleItemDetails: {
    fontSize: 12,
    color: '#64748b',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontSize: 12,
    color: '#94a3b8',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2563eb',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
  partsContainer: {
    marginBottom: 16,
  },
  addPartSection: {
    marginBottom: 12,
  },
  addPartLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  partsScrollView: {
    maxHeight: 120,
  },
  partOption: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  partOptionName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  partOptionPrice: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '500',
  },
  partOptionQuantity: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '600',
    marginBottom: 2,
  },
  partOptionCost: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '400',
  },
  selectedPartsSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  selectedPartsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  selectedPartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
  },
  selectedPartInfo: {
    flex: 1,
  },
  selectedPartName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  selectedPartPrice: {
    fontSize: 11,
    color: '#64748b',
  },
  partQuantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  removePartButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  partsTotalContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    marginTop: 8,
  },
  partsTotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
    textAlign: 'right',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#e2e8f0',
  },
  serviceSummaryContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  serviceSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: 'bold',
  },

});