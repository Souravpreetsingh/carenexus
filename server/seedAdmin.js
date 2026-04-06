require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const exists = await User.findOne({ role: 'admin' });
  if (exists) { console.log('Admin already exists:', exists.email); process.exit(0); }

  await User.create({
    username: 'admin',
    email: 'admin@safespace.com',
    password: 'Admin@1234',
    role: 'admin'
  });
  console.log('Admin created — email: admin@safespace.com  password: Admin@1234');
  process.exit(0);
}

seed().catch(err => { console.error(err.message); process.exit(1); });
