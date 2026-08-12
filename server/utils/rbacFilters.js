import dbHelper from './dbHelper.js';
import Mine from '../models/Mine.js';
import Employee from '../models/Employee.js';

/**
 * Builds a database query filter object based on the user's role and the requested module.
 * If the user has no access, it returns { _id: null }.
 */
export const buildRoleFilter = async (user, moduleName) => {
  if (user.role === 'Admin') return {}; // Full access

  const DENY = { _id: null };
  const userId = user._id.toString();

  // Pre-fetch assigned mine IDs for roles that need them (Mine Manager, Production Manager, Safety Officer)
  let assignedMineIds = [];
  if (['Mine Manager', 'Production Manager', 'Safety Officer'].includes(user.role)) {
    const supervisedMines = await dbHelper.find(Mine, { supervisor: userId });
    const mineIds = new Set(supervisedMines.map(m => m._id.toString()));
    if (user.assignedMines && user.assignedMines.length > 0) {
      user.assignedMines.forEach(id => mineIds.add(id.toString()));
    }
    assignedMineIds = Array.from(mineIds);
  }

  // Pre-fetch relevant employees for roles that need attendance/leave filtering
  const getRelevantEmployeeIds = async () => {
    const allEmployees = await dbHelper.find(Employee);
    return allEmployees.filter(emp => {
      if (emp._id.toString() === userId) return true; // Own data
      
      // If manager has assigned mines, check if employee belongs to any of them
      if (assignedMineIds.length > 0 && emp.assignedMines) {
        if (emp.assignedMines.some(mId => assignedMineIds.includes(mId.toString()))) {
          return true;
        }
      }
      
      // Fallback: Same department
      if (emp.department === user.department) return true;

      return false;
    }).map(e => e._id.toString());
  };

  switch (user.role) {
    case 'Employee':
      if (['Attendance', 'Leave'].includes(moduleName)) return { employee: userId };
      if (moduleName === 'SafetyIncident') return { reportedBy: userId };
      if (moduleName === 'Circular') return {}; // View all notices
      if (moduleName === 'Employee') return { _id: userId }; // Can only see own profile
      return DENY;

    case 'HR':
      if (['Employee', 'Attendance', 'Leave', 'Circular'].includes(moduleName)) return {};
      return DENY;

    case 'Mine Manager':
      if (moduleName === 'Mine') {
        if (assignedMineIds.length === 0) return DENY;
        return { _id: { $in: assignedMineIds } };
      }
      if (['Production', 'SafetyIncident'].includes(moduleName)) {
        return { mine: { $in: assignedMineIds } };
      }
      if (moduleName === 'Equipment') return { assignedMine: { $in: assignedMineIds } };
      if (moduleName === 'Procurement') return { requestedBy: userId };
      if (['Attendance', 'Leave'].includes(moduleName)) {
        const empIds = await getRelevantEmployeeIds();
        return { employee: { $in: empIds } };
      }
      if (['Circular', 'Employee'].includes(moduleName)) {
        if (moduleName === 'Employee') {
          const empIds = await getRelevantEmployeeIds();
          return { _id: { $in: empIds } };
        }
        return {};
      }
      return DENY;

    case 'Production Manager':
      if (moduleName === 'Production') {
        if (assignedMineIds.length > 0) return { mine: { $in: assignedMineIds } };
        return {}; 
      }
      if (moduleName === 'Equipment') {
         if (assignedMineIds.length > 0) return { assignedMine: { $in: assignedMineIds } };
         return {}; 
      }
      if (moduleName === 'Procurement') return { requestedBy: userId };
      if (['Attendance', 'Leave'].includes(moduleName)) {
        const empIds = await getRelevantEmployeeIds();
        return { employee: { $in: empIds } };
      }
      if (moduleName === 'Employee') {
        const empIds = await getRelevantEmployeeIds();
        return { _id: { $in: empIds } };
      }
      if (moduleName === 'Circular') return {};
      return DENY;

    case 'Finance Manager':
      if (moduleName === 'Finance') return {};
      if (moduleName === 'Procurement') return {}; 
      if (['Circular'].includes(moduleName)) return {};
      if (['Employee'].includes(moduleName)) return { _id: userId };
      if (['Attendance', 'Leave'].includes(moduleName)) return { employee: userId };
      return DENY;

    case 'Inventory Manager':
      if (['Inventory', 'Vendor', 'Procurement', 'Dispatch', 'Equipment', 'Vehicle'].includes(moduleName)) return {};
      if (['Circular'].includes(moduleName)) return {};
      if (['Employee'].includes(moduleName)) return { _id: userId };
      if (['Attendance', 'Leave'].includes(moduleName)) return { employee: userId };
      return DENY;

    case 'Safety Officer':
      if (moduleName === 'SafetyIncident') {
        if (assignedMineIds.length > 0) return { mine: { $in: assignedMineIds } };
        return {}; 
      }
      if (['Circular'].includes(moduleName)) return {};
      if (['Employee'].includes(moduleName)) return { _id: userId };
      if (['Attendance', 'Leave'].includes(moduleName)) return { employee: userId };
      return DENY;

    default:
      return DENY;
  }
};
