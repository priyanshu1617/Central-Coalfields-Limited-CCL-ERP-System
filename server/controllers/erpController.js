import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/auth.js';
import dbHelper, { generateId } from '../utils/dbHelper.js';
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

// ==========================================
// 1. AUTHENTICATION CONTROLLER
// ==========================================
export const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Trim whitespace and normalize case to prevent login failures due to trailing spaces
    email = email.trim().toLowerCase();

    const employee = await dbHelper.findOne(Employee, { email });
    if (!employee) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: employee._id, role: employee.role }, JWT_SECRET, { expiresIn: '8h' });

    // Remove password from response
    const employeeObj = employee.toObject ? employee.toObject() : { ...employee };
    const userResponse = { ...employeeObj };
    delete userResponse.password;

    res.status(200).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    let { name, email, password, role, employeeId, department, designation } = req.body;
    if (!name || !email || !password || !employeeId || !department || !designation) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (name, email, password, employeeId, department, designation).' });
    }

    // Sanitize inputs
    name = name.trim();
    email = email.trim().toLowerCase();
    employeeId = employeeId.trim().toUpperCase();
    department = department.trim();
    designation = designation.trim();

    // Server-side strict domain security check
    if (!email.endsWith('@ccl.gov.in')) {
      return res.status(400).json({ success: false, message: 'Registration is restricted to official @ccl.gov.in email addresses.' });
    }

    // Server-side strict Employee ID format verification
    if (!/^CCL\d+$/.test(employeeId)) {
      return res.status(400).json({ success: false, message: 'Employee ID must start with "CCL" followed by numbers (e.g. CCL108).' });
    }

    const existing = await dbHelper.findOne(Employee, { $or: [{ email }, { employeeId }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An employee with this email or ID already exists.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newEmp = await dbHelper.create(Employee, {
      name,
      email,
      password: hashedPassword,
      role: role || 'Employee',
      employeeId,
      department,
      designation,
      baseSalary: 35000,
      timeline: [{ date: new Date(), event: 'Registration', details: 'Self-registered on CCL ERP system' }]
    });

    res.status(201).json({ success: true, message: 'Registered successfully', data: newEmp });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const userObj = req.user.toObject ? req.user.toObject() : { ...req.user };
    delete userObj.password;
    res.status(200).json({ success: true, user: userObj });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await dbHelper.findById(Employee, req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    await dbHelper.save(Employee, user);

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. EMPLOYEES CONTROLLERS (HR)
// ==========================================
export const getEmployees = async (req, res, next) => {
  try {
    const employees = await dbHelper.find(Employee);
    res.status(200).json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, role, employeeId, department, designation, baseSalary } = req.body;

    const existing = await dbHelper.findOne(Employee, { $or: [{ email }, { employeeId }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Employee with this email or ID already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password || 'ccl12345', 10);

    const newEmp = await dbHelper.create(Employee, {
      name,
      email,
      password: hashedPassword,
      role,
      employeeId,
      department,
      designation,
      baseSalary: Number(baseSalary || 35000),
      timeline: [{ date: new Date(), event: 'Joined', details: 'Added to CCL ERP system' }]
    });

    res.status(201).json({ success: true, data: newEmp });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await dbHelper.findByIdAndUpdate(Employee, id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await dbHelper.findByIdAndDelete(Employee, id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, data: deleted });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. ATTENDANCE CONTROLLERS
// ==========================================
export const getAttendance = async (req, res, next) => {
  try {
    const list = await dbHelper.find(Attendance, {}, ['employee']);
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

export const checkIn = async (req, res, next) => {
  try {
    const employeeId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if checkin already exists
    const existing = await dbHelper.findOne(Attendance, { employee: employeeId, date: today });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already checked in for today' });
    }

    const { shift } = req.body;
    const now = new Date();
    const checkInTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRecord = await dbHelper.create(Attendance, {
      employee: employeeId,
      date: today,
      checkIn: checkInTime,
      shift: shift || 'General',
      status: 'Present'
    });

    res.status(201).json({ success: true, data: newRecord });
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    const employeeId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await dbHelper.findOne(Attendance, { employee: employeeId, date: today });
    if (!record) {
      return res.status(400).json({ success: false, message: 'No check-in record found for today' });
    }

    const now = new Date();
    const checkOutTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Calculate working hours (mocked as 8 hours or dynamic diff)
    const workingHours = 8.5;
    const overtime = 0.5;

    const updated = await dbHelper.findByIdAndUpdate(Attendance, record._id, {
      checkOut: checkOutTime,
      workingHours,
      overtime
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. LEAVE CONTROLLERS
// ==========================================
export const getLeaves = async (req, res, next) => {
  try {
    const list = await dbHelper.find(Leave, {}, ['employee']);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const newLeave = await dbHelper.create(Leave, {
      employee: req.user._id,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: 'Pending'
    });
    res.status(201).json({ success: true, data: newLeave });
  } catch (error) {
    next(error);
  }
};

export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Approved / Rejected
    const updated = await dbHelper.findByIdAndUpdate(Leave, id, {
      status,
      approvedBy: req.user._id
    });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. MINE & PRODUCTION CONTROLLERS
// ==========================================
export const getMines = async (req, res, next) => {
  try {
    const list = await dbHelper.find(Mine, {}, ['supervisor']);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const createMine = async (req, res, next) => {
  try {
    const newMine = await dbHelper.create(Mine, req.body);
    res.status(201).json({ success: true, data: newMine });
  } catch (error) {
    next(error);
  }
};

export const updateMine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await dbHelper.findByIdAndUpdate(Mine, id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const getProductionLogs = async (req, res, next) => {
  try {
    const logs = await dbHelper.find(Production, {}, ['mine', 'supervisor']);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

export const logProduction = async (req, res, next) => {
  try {
    const { mine, quantity, grade, date } = req.body;
    const newLog = await dbHelper.create(Production, {
      mine,
      quantity: Number(quantity),
      grade,
      date: date ? new Date(date) : new Date(),
      supervisor: req.user._id
    });

    // Update the mine's daily output
    await dbHelper.findByIdAndUpdate(Mine, mine, { dailyOutput: Number(quantity) });

    res.status(201).json({ success: true, data: newLog });
  } catch (error) {
    next(error);
  }
};

export const updateProductionLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { mine, quantity, grade, date } = req.body;

    const updateData = {};
    if (mine) updateData.mine = mine;
    if (quantity !== undefined) updateData.quantity = Number(quantity);
    if (grade) updateData.grade = grade;
    if (date) updateData.date = new Date(date);

    const updated = await dbHelper.findByIdAndUpdate(Production, id, updateData);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Production log not found' });
    }

    if (mine && quantity !== undefined) {
      await dbHelper.findByIdAndUpdate(Mine, mine, { dailyOutput: Number(quantity) });
    }

    const populated = await dbHelper.findById(Production, id, ['mine', 'supervisor']);
    res.status(200).json({ success: true, data: populated || updated });
  } catch (error) {
    next(error);
  }
};

export const deleteProductionLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await dbHelper.findByIdAndDelete(Production, id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Production log not found' });
    }
    res.status(200).json({ success: true, data: deleted });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. EQUIPMENT CONTROLLERS
// ==========================================
export const getEquipment = async (req, res, next) => {
  try {
    const list = await dbHelper.find(Equipment, {}, ['assignedMine']);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const createEquipment = async (req, res, next) => {
  try {
    const newEq = await dbHelper.create(Equipment, req.body);
    res.status(201).json({ success: true, data: newEq });
  } catch (error) {
    next(error);
  }
};

export const updateEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await dbHelper.findByIdAndUpdate(Equipment, id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 7. FLEET VEHICLE CONTROLLERS
// ==========================================
export const getVehicles = async (req, res, next) => {
  try {
    const list = await dbHelper.find(Vehicle, {}, ['driver']);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const createVehicle = async (req, res, next) => {
  try {
    const newV = await dbHelper.create(Vehicle, req.body);
    res.status(201).json({ success: true, data: newV });
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await dbHelper.findByIdAndUpdate(Vehicle, id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const logFuel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, cost } = req.body;
    const v = await dbHelper.findById(Vehicle, id);
    if (!v) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    const fuelLogs = v.fuelLogs || [];
    fuelLogs.push({ date: new Date(), quantity: Number(quantity), cost: Number(cost) });

    const updated = await dbHelper.findByIdAndUpdate(Vehicle, id, { fuelLogs });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 8. INVENTORY & VENDOR CONTROLLERS
// ==========================================
export const getInventory = async (req, res, next) => {
  try {
    const list = await dbHelper.find(Inventory, {}, ['supplier']);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const createInventoryItem = async (req, res, next) => {
  try {
    const newItem = await dbHelper.create(Inventory, req.body);
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    next(error);
  }
};

export const updateInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await dbHelper.findByIdAndUpdate(Inventory, id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await dbHelper.findByIdAndDelete(Inventory, id);
    res.status(200).json({ success: true, data: deleted });
  } catch (error) {
    next(error);
  }
};

export const getVendors = async (req, res, next) => {
  try {
    const list = await dbHelper.find(Vendor);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const createVendor = async (req, res, next) => {
  try {
    const newVendor = await dbHelper.create(Vendor, req.body);
    res.status(201).json({ success: true, data: newVendor });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 9. PROCUREMENT CONTROLLERS
// ==========================================
export const getProcurements = async (req, res, next) => {
  try {
    const list = await dbHelper.find(Procurement, {}, ['item', 'requestedBy', 'approvedBy', 'vendor']);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const createProcurement = async (req, res, next) => {
  try {
    const { item, quantity, estimatedCost } = req.body;
    const newReq = await dbHelper.create(Procurement, {
      item,
      quantity: Number(quantity),
      estimatedCost: Number(estimatedCost),
      requestedBy: req.user._id,
      status: 'Pending'
    });
    res.status(201).json({ success: true, data: newReq });
  } catch (error) {
    next(error);
  }
};

export const approveProcurement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, vendor } = req.body; // Approved / Rejected
    const updated = await dbHelper.findByIdAndUpdate(Procurement, id, {
      status,
      vendor,
      approvedBy: req.user._id
    });

    // If approved, simulate ordering and stock update
    if (status === 'Approved') {
      const proc = await dbHelper.findById(Procurement, id);
      const item = await dbHelper.findById(Inventory, proc.item);
      if (item) {
        // Mock automatic delivery for prototype purposes
        await dbHelper.findByIdAndUpdate(Inventory, proc.item, {
          stockQuantity: item.stockQuantity + proc.quantity
        });
      }
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 10. DISPATCH CONTROLLERS
// ==========================================
export const getDispatches = async (req, res, next) => {
  try {
    const list = await dbHelper.find(Dispatch);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const createDispatch = async (req, res, next) => {
  try {
    const newLog = await dbHelper.create(Dispatch, req.body);
    res.status(201).json({ success: true, data: newLog });
  } catch (error) {
    next(error);
  }
};

export const updateDispatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await dbHelper.findByIdAndUpdate(Dispatch, id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 11. FINANCE & PAYROLL CONTROLLERS
// ==========================================
export const getFinanceLogs = async (req, res, next) => {
  try {
    const list = await dbHelper.find(Finance);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const createFinanceLog = async (req, res, next) => {
  try {
    const { type, category, amount, costCenter, description } = req.body;
    const newLog = await dbHelper.create(Finance, {
      type,
      category,
      amount: Number(amount),
      costCenter,
      description
    });
    res.status(201).json({ success: true, data: newLog });
  } catch (error) {
    next(error);
  }
};

export const generatePayslip = async (req, res, next) => {
  try {
    const { employeeId, month } = req.body;
    const emp = await dbHelper.findById(Employee, employeeId);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });

    const base = emp.baseSalary;
    const bonus = Math.round(base * 0.1);
    const tax = Math.round(base * 0.15);
    const deductions = Math.round(base * 0.05);
    const netPay = base + bonus - tax - deductions;

    const payslipHTML = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #002D62; padding-bottom: 10px; }
            .title { font-size: 24px; font-weight: bold; color: #002D62; }
            .subtitle { font-size: 14px; color: #555; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; margin: 20px 0; font-size: 14px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .table th { background-color: #002D62; color: white; }
            .total { font-weight: bold; background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Central Coalfields Limited</div>
            <div class="subtitle">A Subsidiary of Coal India Limited | Govt of India Enterprise</div>
            <h3>PAYSLIP FOR THE MONTH OF ${month || 'MAY 2025'}</h3>
          </div>
          <div class="info-grid">
            <div>
              <strong>Employee ID:</strong> ${emp.employeeId}<br>
              <strong>Name:</strong> ${emp.name}<br>
              <strong>Department:</strong> ${emp.department}
            </div>
            <div>
              <strong>Designation:</strong> ${emp.designation}<br>
              <strong>Role:</strong> ${emp.role}<br>
              <strong>Bank Account:</strong> SBI *********8872
            </div>
          </div>
          <table class="table">
            <thead>
              <tr><th>Earnings</th><th>Amount (INR)</th><th>Deductions</th><th>Amount (INR)</th></tr>
            </thead>
            <tbody>
              <tr><td>Basic Salary</td><td>₹${base.toLocaleString()}</td><td>Income Tax (TDS)</td><td>₹${tax.toLocaleString()}</td></tr>
              <tr><td>Dearness Allowance (DA)</td><td>₹${bonus.toLocaleString()}</td><td>Provident Fund (PF)</td><td>₹${deductions.toLocaleString()}</td></tr>
              <tr class="total"><td>Total Earnings</td><td>₹${(base + bonus).toLocaleString()}</td><td>Total Deductions</td><td>₹${(tax + deductions).toLocaleString()}</td></tr>
              <tr class="total"><td colspan="2">NET SALARY PAYABLE</td><td colspan="2" style="color: green; font-size: 18px;">₹${netPay.toLocaleString()}</td></tr>
            </tbody>
          </table>
          <p style="margin-top: 40px; font-size: 12px; color: #777; text-align: center;">This is a computer-generated document and does not require a physical signature.</p>
        </body>
      </html>
    `;

    res.status(200).send(payslipHTML);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 12. SAFETY CONTROLLERS
// ==========================================
export const getSafetyIncidents = async (req, res, next) => {
  try {
    const list = await dbHelper.find(SafetyIncident, {}, ['mine', 'reportedBy']);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const reportIncident = async (req, res, next) => {
  try {
    const { title, description, severity, mine } = req.body;
    const newIncident = await dbHelper.create(SafetyIncident, {
      title,
      description,
      severity,
      mine,
      reportedBy: req.user._id,
      status: 'Reported'
    });

    // Automatically update the mine safety status to Warning or Critical
    let mineSafety = 'Safe';
    if (severity === 'Critical' || severity === 'High') mineSafety = 'Critical';
    else if (severity === 'Medium') mineSafety = 'Warning';

    await dbHelper.findByIdAndUpdate(Mine, mine, { safetyStatus: mineSafety });

    res.status(201).json({ success: true, data: newIncident });
  } catch (error) {
    next(error);
  }
};

export const updateIncidentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await dbHelper.findByIdAndUpdate(SafetyIncident, id, { status });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 13. CIRCULARS CONTROLLERS
// ==========================================
export const getCirculars = async (req, res, next) => {
  try {
    const list = await dbHelper.find(Circular);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const createCircular = async (req, res, next) => {
  try {
    const newCirc = await dbHelper.create(Circular, req.body);
    res.status(201).json({ success: true, data: newCirc });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 14. SEARCH & DASHBOARD AGGREGATES
// ==========================================
export const getDashboardStats = async (req, res, next) => {
  try {
    // Support date filtering via ?date=YYYY-MM-DD param, fallback to today
    const targetDateStr = req.query.date;
    const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
    const targetDateString = targetDate.toDateString();

    // 1. Fetch all collections
    const activeMines = await dbHelper.find(Mine, { status: 'Operational' });
    const allMines = await dbHelper.find(Mine);
    const totalEquipment = await dbHelper.find(Equipment);
    const runningEquipment = totalEquipment.filter(e => e.status === 'Running');
    const employees = await dbHelper.find(Employee);
    const safetyIncidents = await dbHelper.find(SafetyIncident);
    const openIncidents = safetyIncidents.filter(i => i.status !== 'Resolved');
    const lowStockAlerts = await dbHelper.find(Inventory);
    const alertsCount = lowStockAlerts.filter(i => i.stockQuantity < i.reorderLevel).length;
    const production = await dbHelper.find(Production);
    const financeLogs = await dbHelper.find(Finance);
    const dispatches = await dbHelper.find(Dispatch);

    // 2. Today's production for selected date
    const todayProd = production
      .filter(p => new Date(p.date).toDateString() === targetDateString)
      .reduce((acc, curr) => acc + (curr.quantity || 0), 0);

    // 3. Total revenue
    const totalRevenue = financeLogs
      .filter(f => f.type === 'Revenue')
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // 4. Total despatch tonnage
    const totalDespatch = dispatches.reduce((acc, curr) => acc + (curr.coalQuantity || 0), 0);

    // 5. Build production trend for last 30 days
    const trendDays = 30;
    const trendData = [];
    for (let i = trendDays - 1; i >= 0; i--) {
      const d = new Date(targetDate);
      d.setDate(d.getDate() - i);
      const dStr = d.toDateString();
      const dayTotal = production
        .filter(p => new Date(p.date).toDateString() === dStr)
        .reduce((acc, curr) => acc + (curr.quantity || 0), 0);
      trendData.push({
        day: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`,
        output: dayTotal
      });
    }

    // 6. Mine breakdown for pie chart (by total production per mine name)
    const mineNameMap = {};
    allMines.forEach(m => {
      if (m._id) mineNameMap[m._id.toString()] = m.name;
    });

    const mineProductionMap = {};
    production.forEach(p => {
      let mineName = null;
      if (p.mine && typeof p.mine === 'object' && p.mine.name) {
        mineName = p.mine.name;
      } else if (p.mine) {
        const idStr = p.mine.toString();
        mineName = mineNameMap[idStr] || (typeof p.mine === 'string' && !p.mine.match(/^[0-9a-fA-F]{24}$/) ? p.mine : null);
      }
      if (mineName) {
        mineProductionMap[mineName] = (mineProductionMap[mineName] || 0) + (p.quantity || 0);
      }
    });

    // Fallback to operational mines daily output if no production logs mapped yet
    if (Object.keys(mineProductionMap).length === 0) {
      allMines.forEach(m => {
        mineProductionMap[m.name] = m.dailyOutput || 5000;
      });
    }

    const totalProduced = Object.values(mineProductionMap).reduce((a, b) => a + b, 0) || 1;
    const PIE_COLORS = ['#002D62', '#005bb7', '#0083ff', '#4da6ff', '#FF7F32', '#9333EA'];
    const mineBreakdown = Object.entries(mineProductionMap).slice(0, 6).map(([name, qty], idx) => ({
      name,
      rawQty: qty,
      value: parseFloat(((qty / totalProduced) * 100).toFixed(1)),
      color: PIE_COLORS[idx % PIE_COLORS.length]
    }));

    res.status(200).json({
      success: true,
      stats: {
        coalProductionToday: todayProd,
        manpowerPresent: employees.length,
        equipmentRunning: runningEquipment.length,
        totalDespatch,
        safetyIncidentsThisMonth: openIncidents.length,
        activeMinesCount: activeMines.length,
        lowStockAlertsCount: alertsCount,
        totalRevenue
      },
      productionTrend: trendData,
      mineBreakdown
    });
  } catch (error) {
    next(error);
  }
};

export const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json({ success: true, results: [] });

    const queryRegex = new RegExp(q, 'i');

    const employees = await dbHelper.find(Employee);
    const mines = await dbHelper.find(Mine);
    const equipment = await dbHelper.find(Equipment);
    const inventory = await dbHelper.find(Inventory);

    const matchedEmployees = employees.filter(e => queryRegex.test(e.name) || queryRegex.test(e.employeeId) || queryRegex.test(e.department));
    const matchedMines = mines.filter(m => queryRegex.test(m.name) || queryRegex.test(m.area));
    const matchedEquipment = equipment.filter(eq => queryRegex.test(eq.name) || queryRegex.test(eq.regNumber));
    const matchedInventory = inventory.filter(i => queryRegex.test(i.name) || queryRegex.test(i.category));

    res.status(200).json({
      success: true,
      results: [
        ...matchedEmployees.map(e => ({ type: 'Employee', title: e.name, subtitle: `${e.employeeId} - ${e.designation}`, path: '/hr', id: e._id })),
        ...matchedMines.map(m => ({ type: 'Mine', title: m.name, subtitle: `${m.area} (${m.status})`, path: '/mines', id: m._id })),
        ...matchedEquipment.map(eq => ({ type: 'Equipment', title: eq.name, subtitle: `${eq.regNumber} (${eq.status})`, path: '/fleet', id: eq._id })),
        ...matchedInventory.map(i => ({ type: 'Inventory', title: i.name, subtitle: `${i.stockQuantity} ${i.unit} in stock`, path: '/inventory', id: i._id }))
      ]
    });
  } catch (error) {
    next(error);
  }
};
