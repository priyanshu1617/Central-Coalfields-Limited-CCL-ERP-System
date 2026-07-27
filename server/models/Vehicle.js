import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, unique: true },
  model: { type: String, required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  fuelLogs: [
    {
      date: { type: Date, default: Date.now },
      quantity: { type: Number, required: true }, // Liters
      cost: { type: Number, required: true }
    }
  ],
  maintenanceLogs: [
    {
      date: { type: Date, default: Date.now },
      description: { type: String, required: true },
      cost: { type: Number, required: true }
    }
  ],
  insuranceExpiry: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Active', 'Maintenance', 'Out of Service'],
    default: 'Active'
  },
  gpsStatus: {
    type: String,
    enum: ['Online', 'Offline'],
    default: 'Online'
  }
}, { timestamps: true });

const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
