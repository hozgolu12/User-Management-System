import express from "express";
import { create, getAllUsers, getUserbyId, update,deleteUser } from "../controller/userController";
const router = express.Router();

interface router {
    path: string;
    element: any;
}


router.post("/user", create);
router.get("/users", getAllUsers);
router.get("/user/:id", getUserbyId);
router.post("/update/user/:id", update);
router.delete("/delete/user/:id",deleteUser);

export default router;
