import React, { useState, useCallback, memo, useMemo } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Car, Plus, Search } from 'lucide-react-native';
import { useShopData } from '@/hooks/useShopData';
import { Vehicle } from '@/types';
import { DateRangeFilter } from '@/components/DateRangeFilter';

interface AddVehicleFormProps {
  newVehicle: Partial<Vehicle>;
  onUpdateField: (field: keyof Vehicle, value: string | number) => void;
  onSave: () => void;
  onCancel: () => void;
}

const AddVehicleForm = memo(({ newVehicle, onUpdateField, onSave, onCancel }: AddVehicleFormProps) => {
  const handleMakeChange = useCallback((text: string) => onUpdateField('make', text), [onUpdateField]);
  const handleModelChange = useCallback((text: string) => onUpdateField('model', text), [onUpdateField]);
  const handleYearChange = useCallback((text: string) => onUpdateField('year', parseInt(text) || new Date().getFullYear()), [onUpdateField]);
  const handleLicensePlateChange = useCallback((text: string) => onUpdateField('licensePlate', text), [onUpdateField]);
  const handleVinChange = useCallback((text: string) => onUpdateField('vin', text), [onUpdateField]);
  const handleOdometerChange = useCallback((text: string) => onUpdateField('odometer', parseInt(text) || 0), [onUpdateField]);
  const handleCustomerNameChange = useCallback((text: string) => onUpdateField('customerName', text), [onUpdateField]);
  const handleCustomerPhoneChange = useCallback((text: string) => onUpdateField('customerPhone', text), [onUpdateField]);
  const handleCustomerEmailChange = useCallback((text: string) => onUpdateField('customerEmail', text), [onUpdateField]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.addForm}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.formContent}
      >
      <Text style={styles.addFormTitle}>Add New Vehicle</Text>
      
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Make"
          placeholderTextColor="#374151"
          value={newVehicle.make || ''}
          onChangeText={handleMakeChange}
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Model"
          placeholderTextColor="#374151"
          value={newVehicle.model || ''}
          onChangeText={handleModelChange}
        />
      </View>
      
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Year"
          placeholderTextColor="#374151"
          value={newVehicle.year?.toString() || ''}
          onChangeText={handleYearChange}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="License Plate"
          placeholderTextColor="#374151"
          value={newVehicle.licensePlate || ''}
          onChangeText={handleLicensePlateChange}
        />
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="VIN Number"
        placeholderTextColor="#374151"
        value={newVehicle.vin || ''}
        onChangeText={handleVinChange}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Odometer (km)"
        placeholderTextColor="#374151"
        value={newVehicle.odometer?.toString() || ''}
        onChangeText={handleOdometerChange}
        keyboardType="numeric"
      />
      
      <Text style={styles.sectionLabel}>Customer Information</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Customer Name"
        placeholderTextColor="#374151"
        value={newVehicle.customerName || ''}
        onChangeText={handleCustomerNameChange}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#374151"
        value={newVehicle.customerPhone || ''}
        onChangeText={handleCustomerPhoneChange}
        keyboardType="phone-pad"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email (optional)"
        placeholderTextColor="#374151"
        value={newVehicle.customerEmail || ''}
        onChangeText={handleCustomerEmailChange}
        keyboardType="email-address"
      />
      
      <View style={styles.formButtons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={onSave}
        >
          <Text style={styles.saveButtonText}>Add Vehicle</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});
AddVehicleForm.displayName = 'AddVehicleForm';

export default function VehiclesScreen() {
  const { vehicles, addVehicle, getServicesByVehicle } = useShopData();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    licensePlate: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    odometer: 0,
  });

  const filteredVehicles = useMemo(() => {
    let filtered = [...vehicles];
    
    // Filter by date range (using createdAt or updatedAt)
    if (startDate || endDate) {
      filtered = filtered.filter(vehicle => {
        const vehicleDate = new Date(vehicle.createdAt || vehicle.updatedAt || 0);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start && vehicleDate < start) return false;
        if (end && vehicleDate > end) return false;
        return true;
      });
    }
    
    // Filter by search query
    return filtered.filter(vehicle =>
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
      // Sort by creation date (most recent first)
      const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
      return dateB - dateA;
    });
  }, [vehicles, searchQuery, startDate, endDate]);

  const handleAddVehicle = useCallback(async () => {
    if (newVehicle.make && newVehicle.model && newVehicle.customerName) {
      try {
        await addVehicle(newVehicle as Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>);
        setNewVehicle({
          make: '',
          model: '',
          year: new Date().getFullYear(),
          vin: '',
          licensePlate: '',
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          odometer: 0,
        });
        setShowAddForm(false);
      } catch (error) {
        console.error('Error adding vehicle:', error);
      }
    }
  }, [newVehicle, addVehicle]);

  const VehicleItem = memo(({ item }: { item: Vehicle }) => {
    const services = getServicesByVehicle(item.id);
    const lastService = services.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    return (
      <View style={styles.vehicleItem}>
        <View style={styles.vehicleHeader}>
          <View style={styles.vehicleIcon}>
            <Car size={24} color="#2563eb" />
          </View>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>
              {item.year} {item.make} {item.model}
            </Text>
            <Text style={styles.vehiclePlate}>{item.licensePlate}</Text>
          </View>
          <View style={styles.vehicleStats}>
            <Text style={styles.serviceCount}>{services.length} services</Text>
          </View>
        </View>
        
        <View style={styles.vehicleDetails}>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{item.customerName}</Text>
            <Text style={styles.customerContact}>{item.customerPhone}</Text>
            {item.customerEmail && (
              <Text style={styles.customerContact}>{item.customerEmail}</Text>
            )}
          </View>
          
          <View style={styles.vehicleMeta}>
            <Text style={styles.metaText}>VIN: {item.vin}</Text>
            <Text style={styles.metaText}>Odometer: {item.odometer.toLocaleString()} km</Text>
            {lastService && (
              <Text style={styles.metaText}>
                Last Service: {new Date(lastService.date + 'T00:00:00').toLocaleDateString('en-GB', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric',
                  timeZone: 'Asia/Ho_Chi_Minh'
                })}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  });
  VehicleItem.displayName = 'VehicleItem';

  const updateVehicleField = useCallback((field: keyof Vehicle, value: string | number) => {
    setNewVehicle(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCancel = useCallback(() => {
    setShowAddForm(false);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Vehicles</Text>
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
          placeholder="Search vehicles..."
          placeholderTextColor="#374151"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {showAddForm && (
        <AddVehicleForm
          newVehicle={newVehicle}
          onUpdateField={updateVehicleField}
          onSave={handleAddVehicle}
          onCancel={handleCancel}
        />
      )}

      <FlatList
        data={filteredVehicles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <VehicleItem item={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No vehicles found</Text>
            <Text style={styles.emptySubtext}>Add your first vehicle to get started</Text>
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
  vehicleItem: {
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
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  vehiclePlate: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  vehicleStats: {
    alignItems: 'flex-end',
  },
  serviceCount: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  vehicleDetails: {
    gap: 8,
  },
  customerInfo: {
    gap: 2,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  customerContact: {
    fontSize: 12,
    color: '#64748b',
  },
  vehicleMeta: {
    gap: 2,
  },
  metaText: {
    fontSize: 12,
    color: '#94a3b8',
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 8,
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
});