import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  gstNumber: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  products: [{ type: String }] // Categories or specific products supplied
}, { timestamps: true });

const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);
export default Vendor;
