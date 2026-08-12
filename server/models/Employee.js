import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['Admin', 'HR', 'Mine Manager', 'Production Manager', 'Finance Manager', 'Inventory Manager', 'Safety Officer', 'Employee'],
    default: 'Employee'
  },
  employeeId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  photo: { type: String, default: '' },
  timeline: [
    {
      date: { type: Date, default: Date.now },
      event: { type: String, required: true },
      details: { type: String }
    }
  ],
  emergencyContact: {
    name: { type: String, default: '' },
    relation: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  assignedMines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mine' }],
  documents: [
    {
      name: { type: String },
      url: { type: String }
    }
  ],
  baseSalary: { type: Number, default: 35000 },
  status: {
    type: String,
    enum: ['Active', 'Suspended', 'On Leave', 'Retired'],
    default: 'Active'
  }
}, { timestamps: true });

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
export default Employee;
