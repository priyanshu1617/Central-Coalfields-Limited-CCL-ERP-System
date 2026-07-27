import mongoose from 'mongoose';

const productionSchema = new mongoose.Schema({
  mine: { type: mongoose.Schema.Types.ObjectId, ref: 'Mine', required: true },
  date: { type: Date, default: Date.now },
  quantity: { type: Number, required: true }, // in Tonnes
  grade: {
    type: String,
    required: true,
    enum: ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'G12', 'G13', 'G14', 'G15', 'G16', 'G17']
  },
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true }
}, { timestamps: true });

const Production = mongoose.models.Production || mongoose.model('Production', productionSchema);
export default Production;
