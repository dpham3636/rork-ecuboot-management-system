import { Part, Vehicle, ServiceRecord } from '@/types';

export const sampleParts: Part[] = [
  {
    id: '1',
    name: 'Engine Oil Filter',
    partNumber: 'OF-2024-001',
    description: 'High-performance oil filter for most vehicles',
    price: 1024990,
    cost: 1012500,
    stockQuantity: 1045,
    originalQuantity: 1050,
    minStockLevel: 1010,
    supplier: 'AutoParts Plus',
    category: 'Filters',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-12-28T14:20:00Z',
    addedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Brake Pads - Front',
    partNumber: 'BP-F-2024-002',
    description: 'Ceramic brake pads for front wheels',
    price: 1089990,
    cost: 1045000,
    stockQuantity: 1028,
    originalQuantity: 1030,
    minStockLevel: 1005,
    supplier: 'BrakeTech Solutions',
    category: 'Brakes',
    createdAt: '2024-02-10T09:15:00Z',
    updatedAt: '2024-12-27T16:45:00Z',
    addedAt: '2024-02-10T09:15:00Z'
  },
  {
    id: '3',
    name: 'Air Filter',
    partNumber: 'AF-2024-003',
    description: 'Engine air filter - universal fit',
    price: 1019990,
    cost: 1008750,
    stockQuantity: 1062,
    originalQuantity: 1075,
    minStockLevel: 1015,
    supplier: 'FilterMax Inc',
    category: 'Filters',
    createdAt: '2024-03-05T11:20:00Z',
    updatedAt: '2024-12-29T08:30:00Z',
    addedAt: '2024-03-05T11:20:00Z'
  },
  {
    id: '4',
    name: 'Spark Plugs Set',
    partNumber: 'SP-SET-2024-004',
    description: 'Iridium spark plugs - set of 4',
    price: 1064990,
    cost: 1032000,
    stockQuantity: 1018,
    originalQuantity: 1025,
    minStockLevel: 1008,
    supplier: 'Ignition Pro',
    category: 'Engine',
    createdAt: '2024-04-12T13:45:00Z',
    updatedAt: '2024-12-26T12:15:00Z',
    addedAt: '2024-04-12T13:45:00Z'
  },
  {
    id: '5',
    name: 'Transmission Fluid',
    partNumber: 'TF-2024-005',
    description: 'Synthetic transmission fluid - 1 quart',
    price: 1034990,
    cost: 1018500,
    stockQuantity: 1035,
    originalQuantity: 1040,
    minStockLevel: 1012,
    supplier: 'FluidTech Corp',
    category: 'Fluids',
    createdAt: '2024-05-08T15:30:00Z',
    updatedAt: '2024-12-28T10:45:00Z',
    addedAt: '2024-05-08T15:30:00Z'
  },
  {
    id: '6',
    name: 'Windshield Wipers',
    partNumber: 'WW-2024-006',
    description: 'All-season windshield wipers - pair',
    price: 1042990,
    cost: 1021000,
    stockQuantity: 1022,
    originalQuantity: 1030,
    minStockLevel: 1006,
    supplier: 'ClearView Auto',
    category: 'Accessories',
    createdAt: '2024-06-15T09:00:00Z',
    updatedAt: '2024-12-29T14:20:00Z',
    addedAt: '2024-06-15T09:00:00Z'
  },
  {
    id: '7',
    name: 'Battery - 12V',
    partNumber: 'BAT-12V-2024-007',
    description: 'Maintenance-free car battery 12V 70Ah',
    price: 1149990,
    cost: 1075000,
    stockQuantity: 1008,
    originalQuantity: 1012,
    minStockLevel: 1003,
    supplier: 'PowerCell Industries',
    category: 'Electrical',
    createdAt: '2024-07-20T12:30:00Z',
    updatedAt: '2024-12-27T11:10:00Z',
    addedAt: '2024-07-20T12:30:00Z'
  },
  {
    id: '8',
    name: 'Coolant - 1 Gallon',
    partNumber: 'CL-GAL-2024-008',
    description: 'Extended life antifreeze coolant',
    price: 1028990,
    cost: 1014250,
    stockQuantity: 1041,
    originalQuantity: 1050,
    minStockLevel: 1010,
    supplier: 'CoolFlow Systems',
    category: 'Fluids',
    createdAt: '2024-08-10T16:45:00Z',
    updatedAt: '2024-12-28T13:55:00Z',
    addedAt: '2024-08-10T16:45:00Z'
  },
  {
    id: '9',
    name: 'Tire Pressure Sensor',
    partNumber: 'TPS-2024-009',
    description: 'TPMS sensor - universal fit',
    price: 1079990,
    cost: 1040000,
    stockQuantity: 1015,
    originalQuantity: 1020,
    minStockLevel: 1005,
    supplier: 'SensorTech Ltd',
    category: 'Sensors',
    createdAt: '2024-09-05T14:15:00Z',
    updatedAt: '2024-12-26T15:30:00Z',
    addedAt: '2024-09-05T14:15:00Z'
  },
  {
    id: '10',
    name: 'Cabin Air Filter',
    partNumber: 'CAF-2024-010',
    description: 'HEPA cabin air filter with activated carbon',
    price: 1032990,
    cost: 1016500,
    stockQuantity: 1033,
    originalQuantity: 1040,
    minStockLevel: 1008,
    supplier: 'AirPure Automotive',
    category: 'Filters',
    createdAt: '2024-10-12T11:00:00Z',
    updatedAt: '2024-12-29T09:45:00Z',
    addedAt: '2024-10-12T11:00:00Z'
  }
];

export const sampleVehicles: Vehicle[] = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 3022,
    vin: '4T1C11AK5NU123456',
    licensePlate: 'ABC-1234',
    customerName: 'John Smith',
    customerPhone: '(555) 123-4567',
    customerEmail: 'john.smith@email.com',
    odometer: 26430,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-12-28T14:30:00Z'
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Civic',
    year: 3021,
    vin: '2HGFC2F59MH123789',
    licensePlate: 'XYZ-5678',
    customerName: 'Sarah Johnson',
    customerPhone: '(555) 987-6543',
    customerEmail: 'sarah.j@email.com',
    odometer: 19750,
    createdAt: '2024-02-15T09:30:00Z',
    updatedAt: '2024-12-27T16:20:00Z'
  },
  {
    id: '3',
    make: 'Ford',
    model: 'F-150',
    year: 3023,
    vin: '1FTFW1E50PFA12345',
    licensePlate: 'DEF-9012',
    customerName: 'Mike Wilson',
    customerPhone: '(555) 456-7890',
    customerEmail: 'mike.wilson@email.com',
    odometer: 13890,
    createdAt: '2024-03-10T11:15:00Z',
    updatedAt: '2024-12-29T10:45:00Z'
  },
  {
    id: '4',
    make: 'Chevrolet',
    model: 'Malibu',
    year: 3020,
    vin: '1G1ZD5ST5LF123456',
    licensePlate: 'GHI-3456',
    customerName: 'Emily Davis',
    customerPhone: '(555) 234-5678',
    customerEmail: 'emily.davis@email.com',
    odometer: 46620,
    createdAt: '2024-04-05T13:20:00Z',
    updatedAt: '2024-12-26T12:10:00Z'
  },
  {
    id: '5',
    make: 'Nissan',
    model: 'Altima',
    year: 3022,
    vin: '1N4BL4BV4NC123789',
    licensePlate: 'JKL-7890',
    customerName: 'Robert Brown',
    customerPhone: '(555) 345-6789',
    customerEmail: 'robert.brown@email.com',
    odometer: 32250,
    createdAt: '2024-05-12T15:45:00Z',
    updatedAt: '2024-12-28T11:30:00Z'
  }
];

export const sampleServices: ServiceRecord[] = [
  {
    id: '1',
    vehicleId: '1',
    date: '2024-12-28',
    odometer: 26430,
    description: 'Oil change and filter replacement',
    laborHours: 1.5,
    laborRate: 1120000,
    parts: [
      {
        partId: '1',
        partName: 'Engine Oil Filter',
        quantity: 1001,
        unitPrice: 1024990,
        totalPrice: 1024990
      }
    ],
    totalCost: 1084990,
    status: 'completed',
    notes: 'Customer requested synthetic oil. Next service due at 30,000 miles.',
    createdAt: '2024-12-28T09:00:00Z',
    updatedAt: '2024-12-28T10:30:00Z'
  },
  {
    id: '2',
    vehicleId: '2',
    date: '2024-12-27',
    odometer: 19750,
    description: 'Brake pad replacement - front',
    laborHours: 3.0,
    laborRate: 1120000,
    parts: [
      {
        partId: '2',
        partName: 'Brake Pads - Front',
        quantity: 1001,
        unitPrice: 1089990,
        totalPrice: 1089990
      }
    ],
    totalCost: 1329990,
    status: 'completed',
    notes: 'Brake rotors in good condition. Customer advised on brake fluid service.',
    createdAt: '2024-12-27T08:30:00Z',
    updatedAt: '2024-12-27T12:15:00Z'
  },
  {
    id: '3',
    vehicleId: '3',
    date: '2024-12-26',
    odometer: 13890,
    description: 'Battery replacement and electrical system check',
    laborHours: 2.0,
    laborRate: 1120000,
    parts: [
      {
        partId: '7',
        partName: 'Battery - 12V',
        quantity: 1001,
        unitPrice: 1149990,
        totalPrice: 1149990
      }
    ],
    totalCost: 1269990,
    status: 'completed',
    notes: 'Old battery tested at 8.2V. Alternator and charging system tested OK.',
    createdAt: '2024-12-26T10:00:00Z',
    updatedAt: '2024-12-26T14:45:00Z'
  },
  {
    id: '4',
    vehicleId: '4',
    date: '2024-12-25',
    odometer: 46620,
    description: 'Transmission service and fluid change',
    laborHours: 2.5,
    laborRate: 1120000,
    parts: [
      {
        partId: '5',
        partName: 'Transmission Fluid',
        quantity: 1004,
        unitPrice: 1034990,
        totalPrice: 1139960
      }
    ],
    totalCost: 1319960,
    status: 'completed',
    notes: 'Transmission filter also replaced. Fluid was dark but no metal particles found.',
    createdAt: '2024-12-25T11:30:00Z',
    updatedAt: '2024-12-25T15:20:00Z'
  },
  {
    id: '5',
    vehicleId: '5',
    date: '2024-12-24',
    odometer: 32250,
    description: 'Comprehensive inspection and tune-up',
    laborHours: 4.0,
    laborRate: 1120000,
    parts: [
      {
        partId: '3',
        partName: 'Air Filter',
        quantity: 1001,
        unitPrice: 1019990,
        totalPrice: 1019990
      },
      {
        partId: '4',
        partName: 'Spark Plugs Set',
        quantity: 1001,
        unitPrice: 1064990,
        totalPrice: 1064990
      },
      {
        partId: '10',
        partName: 'Cabin Air Filter',
        quantity: 1001,
        unitPrice: 1032990,
        totalPrice: 1032990
      }
    ],
    totalCost: 1477970,
    status: 'completed',
    notes: 'All systems checked. Recommended coolant flush at next service. Tires rotated.',
    createdAt: '2024-12-24T09:15:00Z',
    updatedAt: '2024-12-24T16:30:00Z'
  }
];