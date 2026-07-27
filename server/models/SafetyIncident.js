import mongoose from 'mongoose';

const safetyIncidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Reported', 'Under Investigation', 'Resolved'],
    default: 'Reported'
  },
  mine: { type: mongoose.Schema.Types.ObjectId, ref: 'Mine', required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true }
}, { timestamps: true });

const SafetyIncident = mongoose.models.SafetyIncident || mongoose.model('SafetyIncident', safetyIncidentSchema);
export default SafetyIncident;
