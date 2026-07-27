import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  checkIn: { type: String, default: '' },
  checkOut: { type: String, default: '' },
  shift: {
    type: String,
    enum: ['Morning', 'Evening', 'Night', 'General'],
    default: 'General'
  },
  workingHours: { type: Number, default: 0 },
  overtime: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Half Day'],
    default: 'Present'
  }
}, { timestamps: true });

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
export default Attendance;
