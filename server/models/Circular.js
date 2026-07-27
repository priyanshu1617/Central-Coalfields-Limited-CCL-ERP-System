import mongoose from 'mongoose';

const circularSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  issuedBy: { type: String, default: 'CCL Ranchi HQ' },
  fileUrl: { type: String, default: '' }
}, { timestamps: true });

const Circular = mongoose.models.Circular || mongoose.model('Circular', circularSchema);
export default Circular;
