const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema (copied from the model)
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: function () {
        return !this.phone;
      },
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address',
      ],
    },
    phone: {
      type: String,
      required: function () {
        return !this.email;
      },
      unique: true,
      match: [
        /^(\+\d{1,3}[- ]?)?\d{10}$/,
        'Please provide a valid phone number (10 digits, optional country code)',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
    },
    roles: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      immutable: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdminUser() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stamen-inherbz';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ roles: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log('Name:', existingAdmin.name);
      console.log('Email:', existingAdmin.email);
      console.log('Phone:', existingAdmin.phone);
      return;
    }

    // Check if we can upgrade an existing user to admin
    const existingUsers = await User.find({});
    console.log(`Found ${existingUsers.length} existing users:`);
    
    existingUsers.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}, Email: ${user.email}, Phone: ${user.phone}, Role: ${user.roles}`);
    });

    if (existingUsers.length > 0) {
      console.log('\nTo make an existing user an admin, you can run one of these commands in MongoDB:');
      existingUsers.forEach((user, index) => {
        console.log(`${index + 1}. db.users.updateOne({_id: ObjectId("${user._id}")}, {$set: {roles: "admin"}})`);
      });
    }

    // Create a new admin user
    const adminEmail = 'admin@ayurshopee.com';
    const adminPhone = '1234567890';
    const adminPassword = 'admin123';
    const adminName = 'Admin User';

    const adminUser = new User({
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      password: adminPassword,
      roles: 'admin'
    });

    await adminUser.save();
    console.log('\nNew admin user created successfully!');
    console.log('Email:', adminEmail);
    console.log('Phone:', adminPhone);
    console.log('Password:', adminPassword);
    console.log('Name:', adminName);
    console.log('\nYou can now login with these credentials to access admin features.');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

createAdminUser();
