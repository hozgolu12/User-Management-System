const User = require("../model/userModel");

const create= async (req,res)=>{
    try {
        const user =new User(req.body);
        const {email}=req.body;
        const userExist=await User.findOne({email});
        if(userExist){
            return res.status(200).json({Message:"User already exist"});
        }
        await user.save();
        res.status(200).json({Message:"User Added successfully"});
    } catch (error) {
        res.status(400).json({Message:error.message});
    }
}

const getAllUsers=async(req,res)=>{
    try {
        const user=await User.find();
        if (!user || user.length === 0) {
            res.status(200).json({ Message: "No users found" });
        } else {
            res.status(200).json({ data: user });
        }
    } catch (error) {
        res.status(500).json({Message:error.message});
    }
}

const getUserbyId=async(req,res)=>{
    try {
        const user=await User.findById(req.params.id);
        if (!user) {
            res.status(200).json({ Message: "User not found" });
        } else {
            res.status(200).json({ data: user });
        }
    } catch (error) {
        res.status(500).json({Message:error.message});
    }
}

const update = async (req, res) => {
    try {
      const id = req.params.id;
      const user= await User.findById(id);
      if (!user) {
        res.status(200).json({ Message: "User not found" });
      } else {
        const {email}=user;
        const userExist=await User.findOne({email});
        if(userExist){
            return res.status(200).json({Message:"Email already exist"});
        }
        const updatedUser = await User.findByIdAndUpdate(id, req.body, {
          new: true
        });
        res.status(200).json({ Message: "User updated successfully"});
      }
    } catch (error) {
      res.status(500).json({ Message: error.message });
    }
  };

const deleteUser = async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.findById(id);
      if (!user) {
        res.status(200).json({ Message: "User not found" });
      } else {
        await User.findByIdAndDelete(id);
        res.status(200).json({ Message: "User deleted successfully" });
      }
    } catch (error) {
      res.status(500).json({ Message: error.message });
    }
  };

module.exports={create,getAllUsers,getUserbyId,update,deleteUser};