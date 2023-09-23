import UserModel from "../models/user.model.js";
import bcrypt from "bcrypt";

export const RegisterAdmin = async (req, res) => {
  try {
    const { name, email } = req.body;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }
    const defaultPassword = "X0X0";
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      role: "Admin",
    });
    await newUser.save();
    res.status(201).json({ message: "Admin Has Been Registered" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const uploadProfilePicture = async (req, res) => {
  try {
      const { email } = req.body;
      const profilePictureUrl = req.file.path;
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      user.profileImage = profilePictureUrl;
      await user.save();
      res.status(200).json({ message: "Registration completed successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
}


export const AdminLogIn = async (req, res) => {
    const { email, password } = req.body;
    try {
      const existingUser = await UserModel.findOne({ email });
      if (!existingUser) {
        return res.json({
          status: "Error",
          message: "User not found",
        });
      }
      const isPasswordValid = bcrypt.compare(password, existingUser.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          status: "error",
          message: "Invalid password",
        });
      }
      const token = tokenGen(existingUser);
      existingUser.lastLogin = Date.now();
      existingUser.save();
      res.status(200).json({
        status: "success",
        token, 
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "error",
        message: "Failed to login",
      });
    }
  };    


  export const updatePassword = async (req,res)=>{
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.userAuth;
        const user = await UserModel.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
          return res.status(401).json({ message: "Current password is incorrect." });
        }
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedNewPassword;
        await user.save();
        res.status(200).json({ message: "Password updated successfully." });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
      }
  }

  export const updateUser = async (req, res) => {
    try {
      const userId = req.userAuth;
      const updatedFields = req.body;
      const user = await UserModel.findByIdAndUpdate(
        userId,
        updatedFields,
        { new: true }
      );
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      res.json({
        status: "Success",
        data: user,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  