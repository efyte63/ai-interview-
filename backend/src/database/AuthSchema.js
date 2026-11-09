import mongoose from "mongoose";
import bcrypt from "bcrypt";
const AuthSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },
});

AuthSchema.pre("save", async function () {
  const existingUser = await mongoose.model("user").findOne({
    email: this.email,
    _id: { $ne: this._id },
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});
const AuthModel = mongoose.model("user", AuthSchema);
export default AuthModel;
