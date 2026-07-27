import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. Excavator, Dumper
  regNumber: { type: String, required: true, unique: true },
  model: { type: String, required: true },
  status: {
    type: String,
    enum: ['Running', 'Maintenance', 'Idle'],
    default: 'Idle'
  },
  runningHours: { type: Number, default: 0 },
  fuelConsumption: { type: Number, default: 0 }, // L/h
  nextServiceDate: { type: Date, required: true },
  assignedMine: { type: mongoose.Schema.Types.ObjectId, ref: 'Mine' }
}, { timestamps: true });

const Equipment = mongoose.models.Equipment || mongoose.model('Equipment', equipmentSchema);
export default Equipment;
