import mongoose from 'mongoose';

const dispatchSchema = new mongoose.Schema({
  truckNumber: { type: String, required: true },
  coalQuantity: { type: Number, required: true }, // Tonnes
  destination: { type: String, required: true },
  customer: { type: String, required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  dispatchTime: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Dispatched', 'In Transit', 'Delivered'],
    default: 'Dispatched'
  },
  gatePassNumber: { type: String, required: true }
}, { timestamps: true });

const Dispatch = mongoose.models.Dispatch || mongoose.model('Dispatch', dispatchSchema);
export default Dispatch;
