const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  password: { 
    type: String, 
    required: true,
    default: function() {
      // Set default password as 'N/A' only for User role
      return this.role === 'User' ? 'N/A' : undefined;
    }
  },
  numberPlates: [String],
  role: { 
    type: String, 
    enum: ["Admin", "Operator", "User"],
    required: true 
  },
  isTemporary: { type: Boolean, default: false }
});

// Hash password before saving the user, but only if it's not 'N/A'
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.password === 'N/A') return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Compare hashed password
userSchema.methods.matchPassword = async function (password) {
  try {
    // If password is 'N/A', always return false (can't login with temporary user)
    if (this.password === 'N/A') return false;
    
    console.log('Comparing passwords for user:', this.email);
    const isMatch = await bcrypt.compare(password, this.password);
    console.log('Password match result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

module.exports = mongoose.model("User", userSchema);
