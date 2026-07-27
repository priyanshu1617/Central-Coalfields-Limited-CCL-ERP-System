import mongoose from 'mongoose';

const mineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  area: { type: String, required: true },
  status: {
    type: String,
    enum: ['Operational', 'Maintenance', 'Inactive'],
    default: 'Operational'
  },
  targetOutput: { type: Number, required: true }, // Monthly Target in Tonnes
  dailyOutput: { type: Number, default: 0 }, // Current daily output
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  safetyStatus: {
    type: String,
    enum: ['Safe', 'Warning', 'Critical'],
    default: 'Safe'
  }
}, { timestamps: true });

const Mine = mongoose.models.Mine || mongoose.model('Mine', mineSchema);
export default Mine;
