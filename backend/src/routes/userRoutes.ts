import express from 'express';
import {register, login, getAllUsers, deleteUser, getUserByID, registerUsersFromFile, verifyUser} from '../controllers/userController';
import multer from "multer";

const upload = multer();

const router = express.Router();

router.route("/:id").get(getUserByID);
router.route("/").get(getAllUsers);
router.route("/register").post(register);
router.route("/verify").post(verifyUser);
router.route("/login").post(login);
router.route("/upload").post(upload.single("csvFile"), registerUsersFromFile);
router.route("/delete").post(deleteUser);

export default router;