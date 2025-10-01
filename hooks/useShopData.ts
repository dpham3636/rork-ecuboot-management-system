import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { Part, ServiceRecord, Vehicle } from '@/types';
import { sampleParts, sampleVehicles, sampleServices } from '@/mocks/sampleData';

const storage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(key);
    }
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(key, value);
    }
  },
};

const STORAGE_KEYS = {
  PARTS: 'shop_parts',
  VEHICLES: 'shop_vehicles',
  SERVICES: 'shop_services',
};

export const [ShopDataProvider, useShopData] = createContextHook(() => {
  const [parts, setParts] = useState<Part[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const [partsData, vehiclesData, servicesData] = await Promise.all([
          storage.getItem(STORAGE_KEYS.PARTS),
          storage.getItem(STORAGE_KEYS.VEHICLES),
          storage.getItem(STORAGE_KEYS.SERVICES),
        ]);

        if (partsData) {
          const parsedParts = JSON.parse(partsData) as Part[];
          setParts(parsedParts);
        } else {
          setParts([]);
        }
        
        if (vehiclesData) {
          setVehicles(JSON.parse(vehiclesData));
        } else {
          setVehicles([]);
        }
        
        if (servicesData) {
          const parsedServices = JSON.parse(servicesData) as ServiceRecord[];
          setServices(parsedServices);
        } else {
          setServices([]);
        }
      } catch (error) {
        console.error('Error loading shop data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save parts to storage
  const saveParts = useCallback(async (validatedParts: Part[]) => {
    if (!validatedParts || !Array.isArray(validatedParts)) return;
    try {
      await storage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(validatedParts));
      setParts(validatedParts);
    } catch (error) {
      console.error('Error saving parts:', error);
    }
  }, []);

  // Save vehicles to storage
  const saveVehicles = useCallback(async (validatedVehicles: Vehicle[]) => {
    if (!validatedVehicles || !Array.isArray(validatedVehicles)) return;
    try {
      await storage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(validatedVehicles));
      setVehicles(validatedVehicles);
    } catch (error) {
      console.error('Error saving vehicles:', error);
    }
  }, []);

  // Save services to storage
  const saveServices = useCallback(async (validatedServices: ServiceRecord[]) => {
    if (!validatedServices || !Array.isArray(validatedServices)) return;
    try {
      await storage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(validatedServices));
      setServices(validatedServices);
    } catch (error) {
      console.error('Error saving services:', error);
    }
  }, []);

  // Part operations
  const addPart = useCallback(async (part: Omit<Part, 'id' | 'createdAt' | 'updatedAt' | 'addedAt' | 'originalQuantity'>) => {
    // Create current timestamp in Vietnam timezone (UTC+7)
    const now = new Date();
    const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const currentTimestamp = vietnamTime.toISOString();
    
    // Always create a new inventory entry instead of updating existing ones
    // This allows tracking each inventory addition separately
    const newPart: Part = {
      ...part,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Ensure unique ID
      originalQuantity: part.stockQuantity, // Store the original quantity that was input
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      addedAt: currentTimestamp,
    };
    const updatedParts = [...parts, newPart];
    await saveParts(updatedParts);
  }, [parts, saveParts]);

  const updatePart = useCallback(async (id: string, updates: Partial<Part>) => {
    // Create current timestamp in Vietnam timezone (UTC+7)
    const now = new Date();
    const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const currentTimestamp = vietnamTime.toISOString();
    
    const updatedParts = parts.map(part =>
      part.id === id
        ? { ...part, ...updates, updatedAt: currentTimestamp }
        : part
    );
    await saveParts(updatedParts);
  }, [parts, saveParts]);

  const deletePart = useCallback(async (id: string) => {
    const updatedParts = parts.filter(part => part.id !== id);
    await saveParts(updatedParts);
  }, [parts, saveParts]);

  // Vehicle operations
  const addVehicle = useCallback(async (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Create current timestamp in Vietnam timezone (UTC+7)
    const now = new Date();
    const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const currentTimestamp = vietnamTime.toISOString();
    
    const newVehicle: Vehicle = {
      ...vehicle,
      id: Date.now().toString(),
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
    };
    const updatedVehicles = [...vehicles, newVehicle];
    await saveVehicles(updatedVehicles);
  }, [vehicles, saveVehicles]);

  const updateVehicle = useCallback(async (id: string, updates: Partial<Vehicle>) => {
    // Create current timestamp in Vietnam timezone (UTC+7)
    const now = new Date();
    const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const currentTimestamp = vietnamTime.toISOString();
    
    const updatedVehicles = vehicles.map(vehicle =>
      vehicle.id === id
        ? { ...vehicle, ...updates, updatedAt: currentTimestamp }
        : vehicle
    );
    await saveVehicles(updatedVehicles);
  }, [vehicles, saveVehicles]);

  // Service operations
  const addService = useCallback(async (service: Omit<ServiceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Create current timestamp in Vietnam timezone (UTC+7)
    const now = new Date();
    const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const currentTimestamp = vietnamTime.toISOString();
    
    const newService: ServiceRecord = {
      ...service,
      id: Date.now().toString(),
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
    };
    
    // Note: Inventory quantities are NOT deducted when services are created.
    // Each inventory entry maintains its fixed quantity as a record of what was added.
    // The dashboard shows the total available stock by summing all inventory entries.
    
    const updatedServices = [...services, newService];
    await saveServices(updatedServices);
  }, [services, saveServices]);

  const updateService = useCallback(async (id: string, updates: Partial<ServiceRecord>) => {
    // Create current timestamp in Vietnam timezone (UTC+7)
    const now = new Date();
    const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const currentTimestamp = vietnamTime.toISOString();
    
    const updatedServices = services.map(service =>
      service.id === id
        ? { ...service, ...updates, updatedAt: currentTimestamp }
        : service
    );
    await saveServices(updatedServices);
  }, [services, saveServices]);

  // Helper functions
  const getVehicleById = useCallback((id: string) => {
    return vehicles.find(vehicle => vehicle.id === id);
  }, [vehicles]);

  const getServicesByVehicle = useCallback((vehicleId: string) => {
    return services.filter(service => service.vehicleId === vehicleId);
  }, [services]);

  const getLowStockParts = useCallback(() => {
    return parts.filter(part => part.stockQuantity <= part.minStockLevel);
  }, [parts]);

  // Clear all data function
  const clearAllData = useCallback(async () => {
    try {
      await Promise.all([
        storage.setItem(STORAGE_KEYS.PARTS, JSON.stringify([])),
        storage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify([])),
        storage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify([])),
      ]);
      setParts([]);
      setVehicles([]);
      setServices([]);
      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }, []);

  // Reset to sample data function
  const resetToSampleData = useCallback(async () => {
    try {
      console.log('Resetting to sample data...');
      await Promise.all([
        storage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(sampleParts)),
        storage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(sampleVehicles)),
        storage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(sampleServices)),
      ]);
      setParts(sampleParts);
      setVehicles(sampleVehicles);
      setServices(sampleServices);
      console.log('Sample data loaded successfully');
    } catch (error) {
      console.error('Error loading sample data:', error);
    }
  }, []);

  return useMemo(() => ({
    parts,
    vehicles,
    services,
    isLoading,
    addPart,
    updatePart,
    deletePart,
    addVehicle,
    updateVehicle,
    addService,
    updateService,
    getVehicleById,
    getServicesByVehicle,
    getLowStockParts,
    clearAllData,
    resetToSampleData,
  }), [
    parts,
    vehicles,
    services,
    isLoading,
    addPart,
    updatePart,
    deletePart,
    addVehicle,
    updateVehicle,
    addService,
    updateService,
    getVehicleById,
    getServicesByVehicle,
    getLowStockParts,
    clearAllData,
    resetToSampleData,
  ]);
});