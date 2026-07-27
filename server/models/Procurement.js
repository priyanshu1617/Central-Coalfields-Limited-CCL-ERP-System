import mongoose from 'mongoose';

const procurementSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  quantity: { type: Number, required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Ordered', 'Completed'],
    default: 'Pending'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  estimatedCost: { type: Number, default: 0 }
}, { timestamps: true });

const Procurement = mongoose.models.Procurement || mongoose.model('Procurement', procurementSchema);
export default Procurement;
