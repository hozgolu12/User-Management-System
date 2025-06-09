import User from "../model/userModel";

interface CreateUserReq {
  body: {
    email: string;
  };
}

interface GetUserByIdReq {
  params: {
    id: string;
  };
}

interface UpdateUserReq {
  params: {
    id: string;
  };
  body: {
    email: string;
  };
}

interface DeleteUserReq {
  params: {
    id: string;
  };
}

const validateEmail = (email: string) => {  
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

const create = async (req: CreateUserReq, res: any) => {
  try {
    const user = new User(req.body);
    const { email } = req.body;
    if (!validateEmail(email)) {
      return res.status(422).json({ message: "Invalid email format" });
    }
    await user.save();
    res.status(200).json({ message: "User Added successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req: any, res: any) => {
  try {
    const user = await User.find();
    if (!user || user.length === 0) {
      res.status(404).json({ message: "No users found" });
    } else {
      res.status(200).json({ data: user });
    }
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};

const getUserbyId = async (req: GetUserByIdReq, res: any) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(200).json({ data: user });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const update = async (req: UpdateUserReq, res: any) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    const { email } = req.body;
    if (!validateEmail(email)) {
      return res.status(422).json({ message: "Invalid email format" });
    }
    else {
      await User.findByIdAndUpdate(id, req.body, { new: true });
      res.status(200).json({ message: "User updated successfully" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req: DeleteUserReq, res: any) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      await User.findByIdAndDelete(id);
      res.status(200).json({ message: "User deleted successfully" });
    }
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};

export   {create,getAllUsers,getUserbyId,update,deleteUser};