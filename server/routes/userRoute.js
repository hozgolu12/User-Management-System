const express = require("express");
const {create,getAllUsers,getUserbyId,update, deleteUser} = require("../controller/userController");

const router = express.Router();

router.post("/user", create);
router.get("/users", getAllUsers);
router.get("/user/:id", getUserbyId);
router.put("/update/user/:id", update);
router.delete("/delete/user/:id",deleteUser);

module.exports = router;