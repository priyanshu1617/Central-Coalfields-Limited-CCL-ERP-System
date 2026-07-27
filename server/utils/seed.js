import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, getDbMode, mockDataDir } from '../config/db.js';
import Employee from '../models/Employee.js';
import Mine from '../models/Mine.js';
import Production from '../models/Production.js';
import Equipment from '../models/Equipment.js';
import Vehicle from '../models/Vehicle.js';
import Inventory from '../models/Inventory.js';
import Vendor from '../models/Vendor.js';
import Procurement from '../models/Procurement.js';
import Dispatch from '../models/Dispatch.js';
import Finance from '../models/Finance.js';
import Leave from '../models/Leave.js';
import Attendance from '../models/Attendance.js';
import SafetyIncident from '../models/SafetyIncident.js';
import Circular from '../models/Circular.js';

// Setup environment variables config
import dotenv from 'dotenv';
dotenv.config();

const passwordHash = bcrypt.hashSync('ccl12345', 10);

const generateId = () => {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

const runSeeder = async () => {
  console.log('🌱 Starting database seeding...');
  await connectDB();
  const mockMode = getDbMode();

  // Create datasets
  const employeeIds = {
    admin: generateId(),
    hr: generateId(),
    manager: generateId(),
    safety: generateId(),
    finance: generateId(),
    production: generateId(),
    inventory: generateId(),
    vikash: generateId(),
    sunil: generateId()
  };

  const employees = [
    {
      _id: employeeIds.admin,
      name: 'Aditya Vardhan',
      email: 'admin@ccl.gov.in',
      password: passwordHash,
      role: 'Admin',
      employeeId: 'CCL001',
      department: 'Administration',
      designation: 'General Manager',
      status: 'Active',
      baseSalary: 120000,
      timeline: [{ date: new Date('2024-01-10'), event: 'Promotion', details: 'Promoted to General Manager' }]
    },
    {
      _id: employeeIds.hr,
      name: 'Priyanka Sharma',
      email: 'hr@ccl.gov.in',
      password: passwordHash,
      role: 'HR',
      employeeId: 'CCL002',
      department: 'Human Resources',
      designation: 'HR Manager',
      status: 'Active',
      baseSalary: 75000,
      timeline: [{ date: new Date('2024-03-15'), event: 'Joining', details: 'Joined CCL Ranchi HQ' }]
    },
    {
      _id: employeeIds.manager,
      name: 'Rajiv Kumar',
      email: 'manager@ccl.gov.in',
      password: passwordHash,
      role: 'Mine Manager',
      employeeId: 'CCL003',
      department: 'Mining Operations',
      designation: 'Senior Mine Manager',
      status: 'Active',
      baseSalary: 95000,
      timeline: [
        { date: new Date('2022-05-20'), event: 'Joining', details: 'Joined as Assistant Mine Manager' },
        { date: new Date('2024-08-01'), event: 'Promotion', details: 'Promoted to Senior Mine Manager' }
      ],
      emergencyContact: { name: 'Sunita Devi', relation: 'Spouse', phone: '+91 9876543210' }
    },
    {
      _id: employeeIds.safety,
      name: 'Sanjeev Nayan',
      email: 'safety@ccl.gov.in',
      password: passwordHash,
      role: 'Safety Officer',
      employeeId: 'CCL004',
      department: 'Safety & Security',
      designation: 'Chief Safety Inspector',
      status: 'Active',
      baseSalary: 80000,
      timeline: [{ date: new Date('2023-06-12'), event: 'Audit Commendation', details: 'Awarded for zero-incident quarter' }]
    },
    {
      _id: employeeIds.finance,
      name: 'Nirmala Gopalan',
      email: 'finance@ccl.gov.in',
      password: passwordHash,
      role: 'Finance Manager',
      employeeId: 'CCL005',
      department: 'Finance & Accounts',
      designation: 'Chief Finance Officer',
      status: 'Active',
      baseSalary: 110000,
      timeline: [{ date: new Date('2021-11-01'), event: 'Joining', details: 'Joined from CIL HQ' }]
    },
    {
      _id: employeeIds.production,
      name: 'Rakesh Prasad',
      email: 'production@ccl.gov.in',
      password: passwordHash,
      role: 'Production Manager',
      employeeId: 'CCL006',
      department: 'Production & Planning',
      designation: 'Production Planner',
      status: 'Active',
      baseSalary: 88000,
      timeline: [{ date: new Date('2023-02-18'), event: 'Joining', details: 'Joined as Planner' }]
    },
    {
      _id: employeeIds.inventory,
      name: 'Sanjay Rawat',
      email: 'inventory@ccl.gov.in',
      password: passwordHash,
      role: 'Inventory Manager',
      employeeId: 'CCL007',
      department: 'Materials Management',
      designation: 'Stores Officer',
      status: 'Active',
      baseSalary: 72000,
      timeline: [{ date: new Date('2024-05-10'), event: 'System Migration', details: 'Oversaw Digital Store Cataloging' }]
    },
    {
      _id: employeeIds.vikash,
      name: 'Vikash Kumar',
      email: 'vikash.kumar@ccl.gov.in',
      password: passwordHash,
      role: 'Employee',
      employeeId: 'CCL008',
      department: 'Mining Operations',
      designation: 'Mining Sirdar',
      status: 'Active',
      baseSalary: 45000,
      timeline: [{ date: new Date('2025-01-05'), event: 'Joining', details: 'Joined North Karanpura Team' }]
    },
    {
      _id: employeeIds.sunil,
      name: 'Sunil Verma',
      email: 'sunil.verma@ccl.gov.in',
      password: passwordHash,
      role: 'Employee',
      employeeId: 'CCL009',
      department: 'Mining Operations',
      designation: 'Mining Sirdar',
      status: 'Active',
      baseSalary: 42000,
      timeline: [{ date: new Date('2025-05-18'), event: 'Joining', details: 'Joined North Karanpura Team as Sirdar' }]
    }
  ];

  const mineIds = {
    nk: generateId(),
    sk: generateId(),
    wb: generateId(),
    eb: generateId(),
    rm: generateId()
  };

  const mines = [
    {
      _id: mineIds.nk,
      name: 'North Karanpura',
      area: 'Karanpura Area',
      status: 'Operational',
      targetOutput: 270000,
      dailyOutput: 8560,
      supervisor: employeeIds.manager,
      safetyStatus: 'Safe'
    },
    {
      _id: mineIds.sk,
      name: 'South Karanpura',
      area: 'Karanpura Area',
      status: 'Operational',
      targetOutput: 240000,
      dailyOutput: 7420,
      supervisor: employeeIds.vikash,
      safetyStatus: 'Safe'
    },
    {
      _id: mineIds.wb,
      name: 'West Bokaro',
      area: 'Bokaro Area',
      status: 'Operational',
      targetOutput: 180000,
      dailyOutput: 5230,
      supervisor: employeeIds.sunil,
      safetyStatus: 'Warning'
    },
    {
      _id: mineIds.eb,
      name: 'East Bokaro',
      area: 'Bokaro Area',
      status: 'Operational',
      targetOutput: 120000,
      dailyOutput: 3520,
      supervisor: employeeIds.manager,
      safetyStatus: 'Warning'
    },
    {
      _id: mineIds.rm,
      name: 'Ramgarh',
      area: 'Ramgarh Area',
      status: 'Operational',
      targetOutput: 90000,
      dailyOutput: 2810,
      supervisor: employeeIds.vikash,
      safetyStatus: 'Safe'
    }
  ];

  // Seed Production details for past 19 days (May 1 to May 19)
  const productionLogs = [];
  const grades = ['G3', 'G4', 'G5', 'G7', 'G9'];
  const startDay = 1;
  const endDay = 19;
  for (let day = startDay; day <= endDay; day++) {
    const date = new Date(`2025-05-${day.toString().padStart(2, '0')}T12:00:00Z`);
    // Seed records for individual mines
    productionLogs.push({
      _id: generateId(),
      mine: mineIds.nk,
      date,
      quantity: Math.floor(8000 + Math.random() * 2000),
      grade: grades[Math.floor(Math.random() * grades.length)],
      supervisor: employeeIds.manager
    });
    productionLogs.push({
      _id: generateId(),
      mine: mineIds.sk,
      date,
      quantity: Math.floor(7000 + Math.random() * 1500),
      grade: grades[Math.floor(Math.random() * grades.length)],
      supervisor: employeeIds.vikash
    });
    productionLogs.push({
      _id: generateId(),
      mine: mineIds.wb,
      date,
      quantity: Math.floor(4500 + Math.random() * 1500),
      grade: grades[Math.floor(Math.random() * grades.length)],
      supervisor: employeeIds.sunil
    });
    productionLogs.push({
      _id: generateId(),
      mine: mineIds.eb,
      date,
      quantity: Math.floor(3000 + Math.random() * 1000),
      grade: grades[Math.floor(Math.random() * grades.length)],
      supervisor: employeeIds.manager
    });
    productionLogs.push({
      _id: generateId(),
      mine: mineIds.rm,
      date,
      quantity: Math.floor(2500 + Math.random() * 800),
      grade: grades[Math.floor(Math.random() * grades.length)],
      supervisor: employeeIds.vikash
    });
  }

  // Equipment details
  const equipment = [
    {
      _id: generateId(),
      name: 'Komatsu PC-1250',
      regNumber: 'EQ-EXC-001',
      model: 'Excavator',
      status: 'Running',
      runningHours: 4200,
      fuelConsumption: 45, // Liters per hour
      nextServiceDate: new Date('2026-08-15'),
      assignedMine: mineIds.nk
    },
    {
      _id: generateId(),
      name: 'Caterpillar 777D',
      regNumber: 'EQ-DMP-001',
      model: 'Dumper',
      status: 'Running',
      runningHours: 5800,
      fuelConsumption: 38,
      nextServiceDate: new Date('2026-08-20'),
      assignedMine: mineIds.sk
    },
    {
      _id: generateId(),
      name: 'Sandvik DR412i',
      regNumber: 'EQ-DRL-001',
      model: 'Drill',
      status: 'Idle',
      runningHours: 1900,
      fuelConsumption: 25,
      nextServiceDate: new Date('2026-09-01'),
      assignedMine: mineIds.wb
    },
    {
      _id: generateId(),
      name: 'Komatsu D375A',
      regNumber: 'EQ-DOZ-001',
      model: 'Dozer',
      status: 'Running',
      runningHours: 3100,
      fuelConsumption: 30,
      nextServiceDate: new Date('2026-08-25'),
      assignedMine: mineIds.eb
    },
    {
      _id: generateId(),
      name: 'Liebherr LTM 1050',
      regNumber: 'EQ-CRN-001',
      model: 'Crane',
      status: 'Maintenance',
      runningHours: 2400,
      fuelConsumption: 20,
      nextServiceDate: new Date('2026-07-22'),
      assignedMine: mineIds.nk
    }
  ];

  // Vehicles (Fleet)
  const vehicleIds = {
    v1: generateId(),
    v2: generateId()
  };
  const vehicles = [
    {
      _id: vehicleIds.v1,
      regNumber: 'JH01EF-1234',
      model: 'Tata Signa 4825.TK',
      driver: employeeIds.vikash,
      insuranceExpiry: new Date('2027-05-10'),
      status: 'Active',
      gpsStatus: 'Online',
      fuelLogs: [{ date: new Date('2026-07-18'), quantity: 180, cost: 16200 }],
      maintenanceLogs: [{ date: new Date('2026-05-15'), description: 'Tyre change and alignment', cost: 35000 }]
    },
    {
      _id: vehicleIds.v2,
      regNumber: 'HR55K-9921',
      model: 'Ashok Leyland U-4019',
      driver: employeeIds.sunil,
      insuranceExpiry: new Date('2026-11-20'),
      status: 'Maintenance',
      gpsStatus: 'Offline',
      fuelLogs: [{ date: new Date('2026-07-15'), quantity: 200, cost: 18000 }],
      maintenanceLogs: [{ date: new Date('2026-07-19'), description: 'Engine oil and coolant replacement', cost: 12000 }]
    }
  ];

  // Vendors
  const vendorIds = {
    v1: generateId(),
    v2: generateId(),
    v3: generateId()
  };
  const vendors = [
    {
      _id: vendorIds.v1,
      companyName: 'Coal India Spares Ltd',
      contactPerson: 'Amit Sharma',
      gstNumber: '20AAACC1234F1Z1',
      phone: '+91 9431100223',
      address: 'Industrial Area, Kokar, Ranchi, Jharkhand',
      products: ['Spare Parts', 'Tools']
    },
    {
      _id: vendorIds.v2,
      companyName: 'Bharat Explosives Ltd',
      contactPerson: 'Rajesh Singh',
      gstNumber: '20BBACD4567G2Z2',
      phone: '+91 6512540982',
      address: 'Gomia Area, Bokaro, Jharkhand',
      products: ['Explosives']
    },
    {
      _id: vendorIds.v3,
      companyName: 'Safety Equipments India',
      contactPerson: 'Megha Gupta',
      gstNumber: '20CCADE8912H3Z3',
      phone: '+91 8002934112',
      address: 'Lalpur, Ranchi, Jharkhand',
      products: ['PPE Kits']
    }
  ];

  // Inventory
  const inventoryIds = {
    diesel: generateId(),
    explosives: generateId(),
    parts: generateId(),
    ppe: generateId()
  };
  const inventory = [
    {
      _id: inventoryIds.diesel,
      name: 'High Speed Diesel',
      category: 'Diesel',
      stockQuantity: 45000,
      reorderLevel: 10000,
      barcode: 'DSL-00982-HSD',
      unit: 'liters',
      supplier: vendorIds.v1
    },
    {
      _id: inventoryIds.explosives,
      name: 'Explosive ANFO (Ammonium Nitrate Fuel Oil)',
      category: 'Explosives',
      stockQuantity: 120, // Low stock, reorder is 150
      reorderLevel: 150,
      barcode: 'EXP-ANFO-7762',
      unit: 'kg',
      supplier: vendorIds.v2
    },
    {
      _id: inventoryIds.parts,
      name: 'Excavator Bucket Teeth PC-1250',
      category: 'Spare Parts',
      stockQuantity: 24,
      reorderLevel: 10,
      barcode: 'SPR-EXC-BUCKET',
      unit: 'pcs',
      supplier: vendorIds.v1
    },
    {
      _id: inventoryIds.ppe,
      name: 'Heavy Duty Mining Safety Kits (Safety Helmet, Steel-Toe Boots, Reflective Vest)',
      category: 'PPE Kits',
      stockQuantity: 80, // Low stock
      reorderLevel: 100,
      barcode: 'PPE-KIT-HEAVY',
      unit: 'pcs',
      supplier: vendorIds.v3
    }
  ];

  // Procurement Requests
  const procurement = [
    {
      _id: generateId(),
      item: inventoryIds.explosives,
      quantity: 100,
      requestedBy: employeeIds.manager,
      status: 'Pending',
      estimatedCost: 150000
    },
    {
      _id: generateId(),
      item: inventoryIds.ppe,
      quantity: 150,
      requestedBy: employeeIds.hr,
      status: 'Approved',
      approvedBy: employeeIds.admin,
      vendor: vendorIds.v3,
      estimatedCost: 225000
    }
  ];

  // Dispatch Logs
  const dispatch = [
    {
      _id: generateId(),
      truckNumber: 'JH01EF-1234',
      coalQuantity: 25, // Tonnes
      destination: 'NTPC Kahalgaon Thermal Power Station',
      customer: 'NTPC Limited',
      invoiceNumber: 'INV-2025-0988',
      dispatchTime: new Date('2025-05-19T10:15:00Z'),
      status: 'In Transit',
      gatePassNumber: 'GP-9921-2025'
    },
    {
      _id: generateId(),
      truckNumber: 'JH02GH-5678',
      coalQuantity: 32,
      destination: 'DVC Bokaro Thermal Power Station',
      customer: 'Damodar Valley Corporation',
      invoiceNumber: 'INV-2025-0989',
      dispatchTime: new Date('2025-05-19T08:30:00Z'),
      status: 'Delivered',
      gatePassNumber: 'GP-9922-2025'
    }
  ];

  // Finance logs
  const finance = [
    {
      _id: generateId(),
      type: 'Revenue',
      category: 'Coal Sales',
      amount: 4500000,
      date: new Date('2025-05-18'),
      costCenter: 'North Karanpura Mine',
      description: 'Invoice payment received from NTPC'
    },
    {
      _id: generateId(),
      type: 'Expense',
      category: 'Fuel Cost',
      amount: 280000,
      date: new Date('2025-05-17'),
      costCenter: 'Ranchi HQ Logistics',
      description: 'Diesel bulk purchase (3500 liters) for dumper fleet'
    },
    {
      _id: generateId(),
      type: 'Expense',
      category: 'Equipment Purchase',
      amount: 15000000,
      date: new Date('2025-05-01'),
      costCenter: 'West Bokaro Mine',
      description: 'Acquisition of new Sandvik Drill Rig'
    },
    {
      _id: generateId(),
      type: 'Expense',
      category: 'Salaries',
      amount: 850000,
      date: new Date('2025-05-01'),
      costCenter: 'Ranchi HQ',
      description: 'Executive and operations team salaries (May 2025)'
    }
  ];

  // Leaves
  const leaves = [
    {
      _id: generateId(),
      employee: employeeIds.vikash,
      leaveType: 'Earned Leave',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-10'),
      reason: 'Visiting hometown for family marriage function',
      status: 'Approved',
      approvedBy: employeeIds.hr
    },
    {
      _id: generateId(),
      employee: employeeIds.sunil,
      leaveType: 'Sick Leave',
      startDate: new Date('2025-05-20'),
      endDate: new Date('2025-05-22'),
      reason: 'Fever and medical checkup',
      status: 'Pending'
    }
  ];

  // Attendance
  const attendance = [
    {
      _id: generateId(),
      employee: employeeIds.manager,
      date: new Date('2025-05-19'),
      checkIn: '08:45 AM',
      checkOut: '05:30 PM',
      shift: 'General',
      workingHours: 8.75,
      overtime: 0.75,
      status: 'Present'
    },
    {
      _id: generateId(),
      employee: employeeIds.vikash,
      date: new Date('2025-05-19'),
      checkIn: '07:55 AM',
      checkOut: '04:15 PM',
      shift: 'Morning',
      workingHours: 8.33,
      overtime: 0.33,
      status: 'Present'
    }
  ];

  // Safety Incidents
  const safetyIncidents = [
    {
      _id: generateId(),
      title: 'Low stock alert: Explosive items in North Karanpura',
      description: 'Explosive ANFO supplies fell below the buffer threshold of 150kg. Operational safety guidelines mandate immediate procurement.',
      date: new Date('2025-05-19T10:20:00Z'),
      severity: 'Medium',
      status: 'Reported',
      mine: mineIds.nk,
      reportedBy: employeeIds.safety
    },
    {
      _id: generateId(),
      title: 'Vehicle HR55K 9921 is due for maintenance',
      description: 'Ashok Leyland dumper has exceeded running hours threshold without a full engine oil and safety audit check.',
      date: new Date('2025-05-19T09:45:00Z'),
      severity: 'Low',
      status: 'Under Investigation',
      mine: mineIds.sk,
      reportedBy: employeeIds.safety
    }
  ];

  // Circulars
  const circulars = [
    {
      _id: generateId(),
      title: 'Safety training scheduled on 25 May 2025',
      content: 'Mandatory monsoon prep and safety guidelines seminar will be held for all mine managers, supervisors, and operations staff at Ranchi HQ.',
      date: new Date('2025-05-18T14:00:00Z'),
      issuedBy: 'Safety Division, CCL HQ'
    },
    {
      _id: generateId(),
      title: 'Monsoon Operations Guidelines 2025',
      content: 'Special precautions regarding mine flooding, haul road friction, and electrical fittings security must be observed from June 1st.',
      date: new Date('2025-05-15T09:00:00Z'),
      issuedBy: 'Director (Operations), CCL'
    }
  ];

  if (mockMode) {
    // Write JSON datasets
    console.log('Writing mock JSON files in:', mockDataDir);
    const collections = {
      employees,
      mines,
      productions: productionLogs,
      equipments: equipment,
      vehicles,
      vendors,
      inventories: inventory,
      procurements: procurement,
      dispatches: dispatch,
      finances: finance,
      leaves,
      attendances: attendance,
      safetyincidents: safetyIncidents,
      circulars
    };

    for (const name in collections) {
      const filePath = path.join(mockDataDir, `${name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(collections[name], null, 2));
      console.log(`✅ Seeded ${collections[name].length} items into mock ${name}.json`);
    }
  } else {
    // Write directly into MongoDB
    console.log('Writing records to connected MongoDB database...');
    try {
      await Employee.deleteMany({});
      await Employee.insertMany(employees);
      console.log('✅ Seeded Employees');

      await Mine.deleteMany({});
      await Mine.insertMany(mines);
      console.log('✅ Seeded Mines');

      await Production.deleteMany({});
      await Production.insertMany(productionLogs);
      console.log('✅ Seeded Production logs');

      await Equipment.deleteMany({});
      await Equipment.insertMany(equipment);
      console.log('✅ Seeded Equipment');

      await Vehicle.deleteMany({});
      await Vehicle.insertMany(vehicles);
      console.log('✅ Seeded Vehicles');

      await Vendor.deleteMany({});
      await Vendor.insertMany(vendors);
      console.log('✅ Seeded Vendors');

      await Inventory.deleteMany({});
      await Inventory.insertMany(inventory);
      console.log('✅ Seeded Inventory items');

      await Procurement.deleteMany({});
      await Procurement.insertMany(procurement);
      console.log('✅ Seeded Procurement requests');

      await Dispatch.deleteMany({});
      await Dispatch.insertMany(dispatch);
      console.log('✅ Seeded Dispatch logs');

      await Finance.deleteMany({});
      await Finance.insertMany(finance);
      console.log('✅ Seeded Finance logs');

      await Leave.deleteMany({});
      await Leave.insertMany(leaves);
      console.log('✅ Seeded Leaves');

      await Attendance.deleteMany({});
      await Attendance.insertMany(attendance);
      console.log('✅ Seeded Attendance');

      await SafetyIncident.deleteMany({});
      await SafetyIncident.insertMany(safetyIncidents);
      console.log('✅ Seeded Safety Incidents');

      await Circular.deleteMany({});
      await Circular.insertMany(circulars);
      console.log('✅ Seeded Circulars');

    } catch (e) {
      console.error('❌ MongoDB seeding failed:', e.message);
    }
  }

  console.log('🎉 Database seeding complete!');
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  process.exit(0);
};

runSeeder().catch(err => {
  console.error('Seeder execution error:', err);
  process.exit(1);
});
