import mongoose from 'mongoose';

const financeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Revenue', 'Expense'],
    required: true
  },
  category: {
    type: String,
    required: true // e.g. Coal Sales, Fuel Cost, Salaries, Equipment Purchase
  },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  costCenter: { type: String, required: true }, // e.g. Ranchi HQ, North Karanpura Mine
  description: { type: String, default: '' }
}, { timestamps: true });

const Finance = mongoose.models.Finance || mongoose.model('Finance', financeSchema);
export default Finance;
