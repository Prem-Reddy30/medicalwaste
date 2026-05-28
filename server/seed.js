const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'compounder'], default: 'compounder' },
  status: { type: String, default: 'active' },
  joinDate: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: 'admin@medical.com' });
  if (existing) {
    console.log('Admin user already exists');
  } else {
    const hashed = await bcrypt.hash('admin123', 10);
    await User.create({ name: 'System Administrator', email: 'admin@medical.com', password: hashed, role: 'admin' });
    console.log('Admin user created: admin@medical.com / admin123');
  }

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
