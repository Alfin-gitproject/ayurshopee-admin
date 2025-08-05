import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address',
      ],
    },
    phone: {
      type: String,
      required: false,
      sparse: true, // Only enforce uniqueness for non-null values
      unique: true,
      match: [
        /^(\+\d{1,3}[- ]?)?\d{10}$/,
        'Please provide a valid phone number (10 digits, optional country code)',
      ],
    },
    password: {
      type: String,
      required: function () {
        // Password is not required for Google authentication
        return this.provider !== 'google';
      },
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
    // Google Authentication fields
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness
    },
    profilePicture: {
      type: String,
      default: '',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: ['google', 'phone', 'email'],
      default: 'email',
    },
    lastLogin: {
      type: Date,
      default: Date.now,
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

// Method to check password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user is admin
UserSchema.methods.isAdmin = function () {
  return this.roles === 'admin';
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
