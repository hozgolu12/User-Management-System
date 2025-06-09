import mongoose from "mongoose";

interface userSchema {
    name: string;
    email: string;
    address: string;
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    }
});

const User = mongoose.model("User", userSchema);

export default  User;