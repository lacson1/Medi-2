/**
 * Mock API Client for Development and Testing
 * Provides mock data and API simulation for the MediFlow application
 */

// Mock data interfaces
interface MockEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

interface MockPatient extends MockEntity {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_number?: string;
  allergies?: string[];
  medications?: string[];
  medical_history?: string[];
  blood_type?: string;
  status: 'active' | 'inactive' | 'archived';
}

interface MockAppointment extends MockEntity {
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  diagnosis?: string;
  treatment_plan?: string;
}

interface MockUser extends MockEntity {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  organization_id?: string;
  is_active: boolean;
  last_login?: string;
  permissions?: string[];
}

interface MockOrganization extends MockEntity {
  name: string;
  type: 'clinic' | 'hospital' | 'pharmacy' | 'lab';
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  license_number?: string;
  is_active: boolean;
}

interface MockLabOrder extends MockEntity {
  patient_id: string;
  doctor_id: string;
  test_type: string;
  test_name: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  ordered_date: string;
  completed_date?: string;
  results?: string;
  notes?: string;
  priority: 'routine' | 'urgent' | 'stat';
}

interface MockInventoryItem extends MockEntity {
  name: string;
  category: 'reagents' | 'consumables' | 'equipment' | 'supplies' | 'chemicals';
  description: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  unit: string;
  cost_per_unit: number;
  supplier: string;
  expiry_date?: string;
  lot_number?: string;
  storage_location: string;
  notes?: string;
  last_updated: string;
}

interface MockEquipment extends MockEntity {
  name: string;
  type: 'analyzer' | 'microscope' | 'centrifuge' | 'incubator' | 'refrigerator' | 'autoclave' | 'other';
  model: string;
  serial_number: string;
  manufacturer: string;
  purchase_date: string;
  warranty_expiry: string;
  location: string;
  status: 'operational' | 'maintenance' | 'out_of_order' | 'calibration' | 'retired';
  description: string;
  notes?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  utilization_rate: number;
}

interface MockMaintenanceRecord extends MockEntity {
  equipment_id: string;
  type: 'preventive' | 'corrective' | 'calibration' | 'inspection';
  description: string;
  scheduled_date: string;
  completed_date?: string;
  technician: string;
  cost: number;
  notes?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface MockQCTest extends MockEntity {
  test_name: string;
  type: 'internal' | 'external' | 'proficiency' | 'calibration' | 'maintenance';
  description: string;
  target_value: number;
  acceptable_range_min: number;
  acceptable_range_max: number;
  actual_value: number;
  status: 'passed' | 'failed' | 'pending' | 'in_progress' | 'cancelled';
  performed_by: string;
  performed_date: string;
  notes?: string;
  corrective_action?: string;
}

interface MockComplianceRecord extends MockEntity {
  area: string;
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'warning' | 'pending_review';
  last_review: string;
  next_review: string;
  responsible_person: string;
  notes?: string;
}

interface MockTelemedicine extends MockEntity {
  session_date: string;
  session_topic: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  session_type: 'consultation' | 'follow_up' | 'emergency';
  patient_id: string;
  patient_name: string;
  provider_id: string;
  provider_name: string;
  duration_minutes: number;
  meeting_link?: string;
  recording_consent: boolean;
  notes?: string;
}

// Mock data
const mockPatients: MockPatient[] = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '1985-06-15',
    gender: 'male',
    phone: '+1-555-0123',
    email: 'john.doe@email.com',
    address: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zip_code: '12345',
    emergency_contact_name: 'Jane Doe',
    emergency_contact_phone: '+1-555-0124',
    insurance_provider: 'Blue Cross',
    insurance_number: 'BC123456789',
    allergies: ['Penicillin'],
    medications: ['Metformin'],
    medical_history: ['Diabetes Type 2'],
    blood_type: 'O+',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z'
  }
];

const mockAppointments: MockAppointment[] = [
  {
    id: '1',
    patient_id: '1',
    doctor_id: '1',
    appointment_date: '2024-01-20',
    appointment_time: '10:00',
    duration: 30,
    type: 'consultation',
    status: 'scheduled',
    notes: 'Regular checkup',
    created_at: '2024-01-15T00:00:00Z'
  }
];

const mockUsers: MockUser[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@mediflow.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    organization_id: '1',
    is_active: true,
    last_login: '2024-01-15T10:00:00Z',
    permissions: ['all'],
    created_at: '2024-01-01T00:00:00Z'
  }
];

const mockOrganizations: MockOrganization[] = [
  {
    id: '1',
    name: 'MediFlow Medical Center',
    type: 'clinic',
    address: '456 Healthcare Blvd',
    city: 'MedCity',
    state: 'CA',
    zip_code: '54321',
    phone: '+1-555-HEALTH',
    email: 'info@mediflow.com',
    license_number: 'LIC123456',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  }
];

const mockLabOrders: MockLabOrder[] = [
  {
    id: '1',
    patient_id: '1',
    doctor_id: '1',
    test_type: 'blood',
    test_name: 'Complete Blood Count',
    status: 'pending',
    ordered_date: '2024-01-15',
    notes: 'Routine blood work',
    priority: 'routine',
    created_at: '2024-01-15T00:00:00Z'
  }
];

const mockInventoryItems: MockInventoryItem[] = [
  {
    id: '1',
    name: 'Blood Collection Tubes',
    category: 'consumables',
    description: 'Sterile blood collection tubes',
    current_stock: 150,
    minimum_stock: 50,
    maximum_stock: 500,
    unit: 'pieces',
    cost_per_unit: 2.50,
    supplier: 'MedSupply Co.',
    expiry_date: '2024-12-31',
    lot_number: 'BC2024001',
    storage_location: 'Room A-1',
    notes: 'Store at room temperature',
    last_updated: '2024-01-15T10:30:00Z',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Glucose Test Strips',
    category: 'reagents',
    description: 'Glucose testing strips for blood glucose monitoring',
    current_stock: 25,
    minimum_stock: 100,
    maximum_stock: 1000,
    unit: 'strips',
    cost_per_unit: 1.20,
    supplier: 'LabTech Solutions',
    expiry_date: '2024-06-15',
    lot_number: 'GS2024002',
    storage_location: 'Refrigerator B-2',
    notes: 'Store in refrigerator, avoid light',
    last_updated: '2024-01-14T14:20:00Z',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Microscope Slides',
    category: 'supplies',
    description: 'Glass microscope slides for specimen examination',
    current_stock: 0,
    minimum_stock: 200,
    maximum_stock: 2000,
    unit: 'pieces',
    cost_per_unit: 0.50,
    supplier: 'Scientific Supplies Inc.',
    lot_number: 'MS2024003',
    storage_location: 'Room C-3',
    notes: 'Handle with care',
    last_updated: '2024-01-13T09:15:00Z',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Hemoglobin Reagent',
    category: 'reagents',
    description: 'Hemoglobin testing reagent for hematology analyzer',
    current_stock: 45,
    minimum_stock: 50,
    maximum_stock: 200,
    unit: 'ml',
    cost_per_unit: 15.75,
    supplier: 'Diagnostic Solutions',
    expiry_date: '2024-03-20',
    lot_number: 'HB2024004',
    storage_location: 'Refrigerator A-1',
    notes: 'Store at 2-8°C, protect from light',
    last_updated: '2024-01-12T11:45:00Z',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Disposable Pipette Tips',
    category: 'consumables',
    description: 'Sterile pipette tips for liquid handling',
    current_stock: 5000,
    minimum_stock: 1000,
    maximum_stock: 10000,
    unit: 'pieces',
    cost_per_unit: 0.08,
    supplier: 'Lab Essentials',
    lot_number: 'PT2024005',
    storage_location: 'Room B-2',
    notes: 'Sterile packaging',
    last_updated: '2024-01-11T16:20:00Z',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'Calcium Control Solution',
    category: 'reagents',
    description: 'Calcium control solution for quality control',
    current_stock: 8,
    minimum_stock: 20,
    maximum_stock: 100,
    unit: 'ml',
    cost_per_unit: 25.00,
    supplier: 'Quality Controls Inc.',
    expiry_date: '2024-02-28',
    lot_number: 'CA2024006',
    storage_location: 'Refrigerator C-1',
    notes: 'Expires soon - order replacement',
    last_updated: '2024-01-10T09:30:00Z',
    created_at: '2024-01-01T00:00:00Z'
  }
];

const mockEquipment: MockEquipment[] = [
  {
    id: '1',
    name: 'Hematology Analyzer',
    type: 'analyzer',
    model: 'Sysmex XN-1000',
    serial_number: 'SYM001234',
    manufacturer: 'Sysmex Corporation',
    purchase_date: '2022-03-15',
    warranty_expiry: '2025-03-15',
    location: 'Lab Room A',
    status: 'operational',
    description: 'Automated hematology analyzer for complete blood count',
    notes: 'Regular maintenance every 3 months',
    last_maintenance: '2024-01-10',
    next_maintenance: '2024-04-10',
    utilization_rate: 85,
    created_at: '2022-03-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Compound Microscope',
    type: 'microscope',
    model: 'Olympus BX53',
    serial_number: 'OLY005678',
    manufacturer: 'Olympus Corporation',
    purchase_date: '2021-08-20',
    warranty_expiry: '2024-08-20',
    location: 'Microscopy Lab',
    status: 'calibration',
    description: 'High-resolution compound microscope for pathology',
    notes: 'Calibration due every 6 months',
    last_maintenance: '2023-12-15',
    next_maintenance: '2024-02-15',
    utilization_rate: 92,
    created_at: '2021-08-20T14:30:00Z'
  },
  {
    id: '3',
    name: 'High-Speed Centrifuge',
    type: 'centrifuge',
    model: 'Eppendorf 5424',
    serial_number: 'EPP009876',
    manufacturer: 'Eppendorf AG',
    purchase_date: '2023-01-10',
    warranty_expiry: '2026-01-10',
    location: 'Sample Processing Room',
    status: 'maintenance',
    description: 'High-speed refrigerated centrifuge for sample processing',
    notes: 'Under preventive maintenance',
    last_maintenance: '2024-01-20',
    next_maintenance: '2024-04-20',
    utilization_rate: 78,
    created_at: '2023-01-10T09:15:00Z'
  },
  {
    id: '4',
    name: 'Chemistry Analyzer',
    type: 'analyzer',
    model: 'Roche Cobas 6000',
    serial_number: 'ROC012345',
    manufacturer: 'Roche Diagnostics',
    purchase_date: '2023-06-01',
    warranty_expiry: '2026-06-01',
    location: 'Chemistry Lab',
    status: 'operational',
    description: 'Automated chemistry analyzer for clinical chemistry tests',
    notes: 'Daily QC required',
    last_maintenance: '2024-01-05',
    next_maintenance: '2024-04-05',
    utilization_rate: 95,
    created_at: '2023-06-01T08:00:00Z'
  },
  {
    id: '5',
    name: 'Incubator',
    type: 'incubator',
    model: 'Thermo Scientific Heratherm',
    serial_number: 'THM056789',
    manufacturer: 'Thermo Fisher Scientific',
    purchase_date: '2022-11-15',
    warranty_expiry: '2025-11-15',
    location: 'Microbiology Lab',
    status: 'operational',
    description: 'General purpose incubator for bacterial culture',
    notes: 'Temperature monitoring required',
    last_maintenance: '2024-01-12',
    next_maintenance: '2024-04-12',
    utilization_rate: 88,
    created_at: '2022-11-15T12:00:00Z'
  },
  {
    id: '6',
    name: 'Refrigerated Centrifuge',
    type: 'centrifuge',
    model: 'Beckman Coulter Allegra X-30R',
    serial_number: 'BCK078901',
    manufacturer: 'Beckman Coulter',
    purchase_date: '2021-12-10',
    warranty_expiry: '2024-12-10',
    location: 'Sample Processing Room',
    status: 'out_of_order',
    description: 'Refrigerated centrifuge for temperature-sensitive samples',
    notes: 'Motor failure - awaiting repair',
    last_maintenance: '2023-11-20',
    next_maintenance: '2024-02-20',
    utilization_rate: 0,
    created_at: '2021-12-10T10:30:00Z'
  }
];

const mockMaintenanceRecords: MockMaintenanceRecord[] = [
  {
    id: '1',
    equipment_id: '1',
    type: 'preventive',
    description: 'Routine cleaning and calibration',
    scheduled_date: '2024-04-10',
    technician: 'John Smith',
    cost: 150,
    notes: 'Scheduled maintenance',
    status: 'scheduled',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    equipment_id: '2',
    type: 'calibration',
    description: 'Annual calibration check',
    scheduled_date: '2024-02-15',
    technician: 'Sarah Johnson',
    cost: 300,
    notes: 'Calibration due',
    status: 'scheduled',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    equipment_id: '3',
    type: 'corrective',
    description: 'Motor replacement and testing',
    scheduled_date: '2024-01-20',
    completed_date: '2024-01-22',
    technician: 'Mike Wilson',
    cost: 800,
    notes: 'Motor replaced successfully',
    status: 'completed',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    equipment_id: '4',
    type: 'preventive',
    description: 'Monthly preventive maintenance',
    scheduled_date: '2024-04-05',
    technician: 'John Smith',
    cost: 200,
    notes: 'Routine maintenance',
    status: 'scheduled',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    equipment_id: '5',
    type: 'inspection',
    description: 'Temperature calibration check',
    scheduled_date: '2024-04-12',
    technician: 'Sarah Johnson',
    cost: 100,
    notes: 'Temperature monitoring',
    status: 'scheduled',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    equipment_id: '6',
    type: 'corrective',
    description: 'Motor failure repair',
    scheduled_date: '2024-02-20',
    technician: 'Mike Wilson',
    cost: 1200,
    notes: 'Motor replacement required',
    status: 'in_progress',
    created_at: '2024-01-01T00:00:00Z'
  }
];

const mockQCTests: MockQCTest[] = [
  {
    id: '1',
    test_name: 'Glucose Control',
    type: 'internal',
    description: 'Daily glucose control testing',
    target_value: 100,
    acceptable_range_min: 95,
    acceptable_range_max: 105,
    actual_value: 98,
    status: 'passed',
    performed_by: 'John Smith',
    performed_date: '2024-01-15',
    notes: 'Within acceptable range',
    corrective_action: '',
    created_at: '2024-01-15T08:00:00Z'
  },
  {
    id: '2',
    test_name: 'Hematology Control',
    type: 'internal',
    description: 'Weekly hematology control testing',
    target_value: 7.2,
    acceptable_range_min: 6.8,
    acceptable_range_max: 7.6,
    actual_value: 7.8,
    status: 'failed',
    performed_by: 'Sarah Johnson',
    performed_date: '2024-01-14',
    notes: 'Value outside acceptable range',
    corrective_action: 'Recalibrated analyzer and retested',
    created_at: '2024-01-14T10:30:00Z'
  },
  {
    id: '3',
    test_name: 'Proficiency Test - Chemistry',
    type: 'proficiency',
    description: 'Monthly proficiency testing for chemistry panel',
    target_value: 0,
    acceptable_range_min: 0,
    acceptable_range_max: 0,
    actual_value: 0,
    status: 'pending',
    performed_by: '',
    performed_date: '',
    notes: 'Scheduled for next week',
    corrective_action: '',
    created_at: '2024-01-10T09:00:00Z'
  },
  {
    id: '4',
    test_name: 'Hemoglobin Control',
    type: 'internal',
    description: 'Daily hemoglobin control testing',
    target_value: 12.5,
    acceptable_range_min: 12.0,
    acceptable_range_max: 13.0,
    actual_value: 12.3,
    status: 'passed',
    performed_by: 'Mike Wilson',
    performed_date: '2024-01-15',
    notes: 'Within acceptable range',
    corrective_action: '',
    created_at: '2024-01-15T09:30:00Z'
  },
  {
    id: '5',
    test_name: 'Chemistry Panel Control',
    type: 'internal',
    description: 'Daily chemistry panel control testing',
    target_value: 140,
    acceptable_range_min: 135,
    acceptable_range_max: 145,
    actual_value: 142,
    status: 'passed',
    performed_by: 'John Smith',
    performed_date: '2024-01-15',
    notes: 'All parameters within range',
    corrective_action: '',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '6',
    test_name: 'Calibration Verification',
    type: 'calibration',
    description: 'Monthly calibration verification',
    target_value: 0,
    acceptable_range_min: -2,
    acceptable_range_max: 2,
    actual_value: 1.2,
    status: 'passed',
    performed_by: 'Sarah Johnson',
    performed_date: '2024-01-12',
    notes: 'Calibration within acceptable limits',
    corrective_action: '',
    created_at: '2024-01-12T14:00:00Z'
  },
  {
    id: '7',
    test_name: 'Temperature Monitoring',
    type: 'maintenance',
    description: 'Daily temperature monitoring for refrigerators',
    target_value: 4,
    acceptable_range_min: 2,
    acceptable_range_max: 6,
    actual_value: 5.5,
    status: 'failed',
    performed_by: 'Mike Wilson',
    performed_date: '2024-01-14',
    notes: 'Temperature slightly above acceptable range',
    corrective_action: 'Adjusted thermostat and monitored for 24 hours',
    created_at: '2024-01-14T16:00:00Z'
  }
];

const mockComplianceRecords: MockComplianceRecord[] = [
  {
    id: '1',
    area: 'Personnel Training',
    requirement: 'Annual competency assessment',
    status: 'compliant',
    last_review: '2024-01-01',
    next_review: '2025-01-01',
    responsible_person: 'Lab Manager',
    notes: 'All staff completed annual competency assessment',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    area: 'Equipment Calibration',
    requirement: 'Quarterly calibration verification',
    status: 'warning',
    last_review: '2023-12-15',
    next_review: '2024-03-15',
    responsible_person: 'Equipment Technician',
    notes: 'Calibration due within 30 days',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    area: 'Documentation',
    requirement: 'Monthly documentation review',
    status: 'non_compliant',
    last_review: '2023-11-30',
    next_review: '2024-01-30',
    responsible_person: 'Quality Manager',
    notes: 'Documentation review overdue',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    area: 'Quality Control',
    requirement: 'Daily QC testing',
    status: 'compliant',
    last_review: '2024-01-15',
    next_review: '2024-01-16',
    responsible_person: 'Lab Technicians',
    notes: 'Daily QC tests completed successfully',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    area: 'Safety Protocols',
    requirement: 'Monthly safety training',
    status: 'compliant',
    last_review: '2024-01-01',
    next_review: '2024-02-01',
    responsible_person: 'Safety Officer',
    notes: 'All staff completed safety training',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    area: 'Sample Handling',
    requirement: 'Chain of custody documentation',
    status: 'warning',
    last_review: '2024-01-10',
    next_review: '2024-02-10',
    responsible_person: 'Sample Coordinator',
    notes: 'Some documentation gaps identified',
    created_at: '2024-01-01T00:00:00Z'
  }
];

const mockTelemedicineSessions: MockTelemedicine[] = [
  {
    id: '1',
    session_date: '2024-01-20T10:00:00Z',
    session_topic: 'Follow-up consultation',
    status: 'scheduled',
    session_type: 'follow_up',
    patient_id: '1',
    patient_name: 'John Doe',
    provider_id: '1',
    provider_name: 'Dr. Smith',
    duration_minutes: 30,
    meeting_link: 'https://meet.example.com/session-1',
    recording_consent: true,
    notes: 'Patient follow-up for diabetes management',
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    session_date: '2024-01-22T14:00:00Z',
    session_topic: 'Initial consultation',
    status: 'completed',
    session_type: 'consultation',
    patient_id: '1',
    patient_name: 'John Doe',
    provider_id: '1',
    provider_name: 'Dr. Smith',
    duration_minutes: 45,
    meeting_link: 'https://meet.example.com/session-2',
    recording_consent: true,
    notes: 'Initial consultation completed successfully',
    created_at: '2024-01-20T00:00:00Z'
  },
  {
    id: '3',
    session_date: '2024-01-25T09:00:00Z',
    session_topic: 'Emergency consultation',
    status: 'cancelled',
    session_type: 'emergency',
    patient_id: '1',
    patient_name: 'John Doe',
    provider_id: '1',
    provider_name: 'Dr. Smith',
    duration_minutes: 15,
    recording_consent: false,
    notes: 'Patient cancelled due to technical issues',
    created_at: '2024-01-24T00:00:00Z'
  }
];

// Generic entity operations
class MockEntityManager<T extends MockEntity> {
  private data: T[];

  constructor(initialData: T[]) {
    this.data = [...initialData];
  }

  async list(): Promise<T[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...this.data];
  }

  async get(id: string): Promise<T | null> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return this.data.find(item => item.id === id) || null;
  }

  async create(itemData: Omit<T, 'id' | 'created_at'>): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newItem = {
      ...itemData,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    } as T;
    this.data.push(newItem);
    return newItem;
  }

  async update(id: string, itemData: Partial<Omit<T, 'id' | 'created_at'>>): Promise<T | null> {
    await new Promise(resolve => setTimeout(resolve, 150));
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) return null;

    const updatedItem = {
      ...this.data[index],
      ...itemData,
      updated_at: new Date().toISOString()
    } as T;

    this.data[index] = updatedItem;
    return updatedItem;
  }

  async delete(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) return false;

    this.data.splice(index, 1);
    return true;
  }
}

// Mock procedural reports data
const mockProceduralReports = [
  {
    id: '1',
    patient_id: '1',
    procedure_name: 'Colonoscopy',
    procedure_type: 'Endoscopy',
    procedure_date: '2024-01-15',
    performed_by: 'Dr. Smith',
    location: 'Operating Room 1',
    indication: 'Routine screening',
    procedure_details: 'Complete colonoscopy performed with no complications',
    findings: 'Normal colonoscopy findings',
    complications: '',
    specimens_collected: 'Biopsy samples',
    status: 'completed',
    follow_up_required: true,
    follow_up_details: {
      date: '2024-02-15',
      time: '10:00',
      doctor: 'Dr. Smith',
      notes: 'Follow-up in 1 month'
    },
    notes: 'Patient tolerated procedure well',
    cost: '1500',
    duration_minutes: '45',
    anesthesia_used: true,
    anesthesia_type: 'Conscious sedation',
    pre_procedure_medications: 'Midazolam',
    post_procedure_medications: 'None',
    discharge_instructions: 'Rest for remainder of day',
    digital_signature: '',
    signed_by: 'Dr. Smith',
    signature_date: '2024-01-15',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    patient_id: '2',
    procedure_name: 'Biopsy',
    procedure_type: 'Biopsy',
    procedure_date: '2024-01-20',
    performed_by: 'Dr. Johnson',
    location: 'Procedure Room 2',
    indication: 'Suspicious lesion',
    procedure_details: 'Skin biopsy performed on left arm',
    findings: 'Lesion removed for analysis',
    complications: '',
    specimens_collected: 'Skin biopsy',
    status: 'completed',
    follow_up_required: true,
    follow_up_details: {
      date: '2024-01-27',
      time: '14:00',
      doctor: 'Dr. Johnson',
      notes: 'Results discussion'
    },
    notes: 'Patient cooperative during procedure',
    cost: '800',
    duration_minutes: '20',
    anesthesia_used: true,
    anesthesia_type: 'Local anesthesia',
    pre_procedure_medications: 'Lidocaine',
    post_procedure_medications: 'Antibiotic ointment',
    discharge_instructions: 'Keep wound clean and dry',
    digital_signature: '',
    signed_by: 'Dr. Johnson',
    signature_date: '2024-01-20',
    created_at: '2024-01-20T14:00:00Z',
    updated_at: '2024-01-20T14:00:00Z'
  }
];

// Mock prescriptions data
const mockPrescriptions = [
  {
    id: '1',
    patient_id: '1',
    medication_name: 'Amoxicillin',
    dosage: '500',
    dosage_unit: 'mg',
    frequency: '3',
    frequency_unit: 'daily',
    quantity: '21',
    refills: 1,
    start_date: '2024-01-15',
    end_date: '2024-01-22',
    prescribing_doctor: 'Dr. Smith',
    pharmacy_name: 'CVS Pharmacy',
    pharmacy_phone: '(555) 123-4567',
    status: 'active',
    notes: 'Take with food',
    special_instructions: 'Complete full course',
    indication: 'Upper respiratory infection',
    route: 'oral',
    duration_days: '7',
    monitoring_required: false,
    lab_monitoring: '',
    side_effects_to_watch: 'Nausea, diarrhea',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    patient_id: '2',
    medication_name: 'Lisinopril',
    dosage: '10',
    dosage_unit: 'mg',
    frequency: '1',
    frequency_unit: 'daily',
    quantity: '30',
    refills: 2,
    start_date: '2024-01-10',
    end_date: '2024-02-10',
    prescribing_doctor: 'Dr. Johnson',
    pharmacy_name: 'Walgreens',
    pharmacy_phone: '(555) 987-6543',
    status: 'active',
    notes: 'Monitor blood pressure',
    special_instructions: 'Take at same time daily',
    indication: 'Hypertension',
    route: 'oral',
    duration_days: '30',
    monitoring_required: true,
    lab_monitoring: 'Blood pressure, kidney function',
    side_effects_to_watch: 'Dry cough, dizziness',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-10T09:00:00Z'
  }
];

// Mock API Client
export const mockApiClient = {
  entities: {
    Patient: new MockEntityManager(mockPatients),
    Appointment: new MockEntityManager(mockAppointments),
    User: new MockEntityManager(mockUsers),
    Organization: new MockEntityManager(mockOrganizations),
    LabOrder: new MockEntityManager(mockLabOrders),
    InventoryItem: new MockEntityManager(mockInventoryItems),
    Equipment: new MockEntityManager(mockEquipment),
    MaintenanceRecord: new MockEntityManager(mockMaintenanceRecords),
    QCTest: new MockEntityManager(mockQCTests),
    ComplianceRecord: new MockEntityManager(mockComplianceRecords),
    Telemedicine: new MockEntityManager(mockTelemedicineSessions),
    ProceduralReport: new MockEntityManager(mockProceduralReports),
    Prescription: new MockEntityManager(mockPrescriptions)
  },

  // Health check
  async healthCheck() {
    await new Promise(resolve => setTimeout(resolve, 50));
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  },

  // Authentication
  async authenticate(credentials: { username: string; password: string }) {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      return {
        token: 'mock-jwt-token',
        user: mockUsers[0],
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
    }
    throw new Error('Invalid credentials');
  },

  // Logout
  async logout() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true };
  }
};

// Export as default for compatibility
export default mockApiClient;
