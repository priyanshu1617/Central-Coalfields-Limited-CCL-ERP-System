import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import upload from '../middleware/upload.js';
import {
  login,
  getProfile,
  changePassword,
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAttendance,
  checkIn,
  checkOut,
  getLeaves,
  applyLeave,
  updateLeaveStatus,
  getMines,
  createMine,
  updateMine,
  getProductionLogs,
  logProduction,
  getEquipment,
  createEquipment,
  updateEquipment,
  getVehicles,
  createVehicle,
  updateVehicle,
  logFuel,
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getVendors,
  createVendor,
  getProcurements,
  createProcurement,
  approveProcurement,
  getDispatches,
  createDispatch,
  updateDispatch,
  getFinanceLogs,
  createFinanceLog,
  generatePayslip,
  getSafetyIncidents,
  reportIncident,
  updateIncidentStatus,
  getCirculars,
  createCircular,
  getDashboardStats,
  globalSearch
} from '../controllers/erpController.js';

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.post('/auth/login', login);

// ==========================================
// PROTECTED ROUTES (Requires JWT)
// ==========================================
router.use(protect);

router.get('/auth/profile', getProfile);
router.post('/auth/change-password', changePassword);

// HR / Employee Management
router.get('/employees', getEmployees);
router.post('/employees', authorize('Admin', 'HR'), createEmployee);
router.put('/employees/:id', authorize('Admin', 'HR'), updateEmployee);
router.delete('/employees/:id', authorize('Admin', 'HR'), deleteEmployee);

// Attendance
router.get('/attendance', getAttendance);
router.post('/attendance/checkin', checkIn);
router.post('/attendance/checkout', checkOut);

// Leaves
router.get('/leaves', getLeaves);
router.post('/leaves', applyLeave);
router.put('/leaves/:id/status', authorize('Admin', 'HR'), updateLeaveStatus);

// Mine Management
router.get('/mines', getMines);
router.post('/mines', authorize('Admin', 'Mine Manager'), createMine);
router.put('/mines/:id', authorize('Admin', 'Mine Manager'), updateMine);

// Coal Production
router.get('/production', getProductionLogs);
router.post('/production', authorize('Admin', 'Mine Manager', 'Production Manager'), logProduction);

// Fleet & Equipment
router.get('/equipment', getEquipment);
router.post('/equipment', authorize('Admin', 'Mine Manager'), createEquipment);
router.put('/equipment/:id', authorize('Admin', 'Mine Manager'), updateEquipment);

router.get('/vehicles', getVehicles);
router.post('/vehicles', authorize('Admin', 'Mine Manager'), createVehicle);
router.put('/vehicles/:id', authorize('Admin', 'Mine Manager'), updateVehicle);
router.post('/vehicles/:id/fuel', logFuel);

// Inventory & Supplier Stores
router.get('/inventory', getInventory);
router.post('/inventory', authorize('Admin', 'Inventory Manager'), createInventoryItem);
router.put('/inventory/:id', authorize('Admin', 'Inventory Manager'), updateInventoryItem);
router.delete('/inventory/:id', authorize('Admin', 'Inventory Manager'), deleteInventoryItem);

router.get('/vendors', getVendors);
router.post('/vendors', authorize('Admin', 'Inventory Manager'), createVendor);

// Procurement Pipeline
router.get('/procurement', getProcurements);
router.post('/procurement', createProcurement);
router.put('/procurement/:id/approve', authorize('Admin', 'Inventory Manager'), approveProcurement);

// Dispatch
router.get('/dispatch', getDispatches);
router.post('/dispatch', authorize('Admin', 'Production Manager', 'Inventory Manager'), createDispatch);
router.put('/dispatch/:id', authorize('Admin', 'Production Manager', 'Inventory Manager'), updateDispatch);

// Finance & Accounts
router.get('/finance', getFinanceLogs);
router.post('/finance', authorize('Admin', 'Finance Manager'), createFinanceLog);
router.post('/payroll/payslip', authorize('Admin', 'Finance Manager', 'HR', 'Employee'), generatePayslip);

// Safety Management
router.get('/safety', getSafetyIncidents);
router.post('/safety/report', authorize('Admin', 'Safety Officer', 'Mine Manager'), reportIncident);
router.put('/safety/:id/status', authorize('Admin', 'Safety Officer'), updateIncidentStatus);

// Circulars & Notices
router.get('/circulars', getCirculars);
router.post('/circulars', authorize('Admin', 'HR'), createCircular);

// Dashboard Aggregates & Global Search
router.get('/dashboard/stats', getDashboardStats);
router.get('/search', globalSearch);

export default router;
