import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['Spare Parts', 'Explosives', 'Diesel', 'Lubricants', 'PPE Kits', 'Tools'],
    required: true
  },
  stockQuantity: { type: Number, required: true, default: 0 },
  reorderLevel: { type: Number, required: true, default: 10 },
  barcode: { type: String, default: '' },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  unit: { type: String, default: 'pcs' } // pcs, kg, liters, etc.
}, { timestamps: true });

const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
export default Inventory;
