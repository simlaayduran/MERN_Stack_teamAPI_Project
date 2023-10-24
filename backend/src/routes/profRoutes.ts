import express from 'express';
import { getAllProfs, addProfs, registerProfFromFile} from '../controllers/profController';
import multer from "multer";

const upload = multer();
const router = express.Router();

router.route("/").get(getAllProfs);
router.route("/add").post(addProfs);
router.route("/upload").post(upload.single("csvFile"), registerProfFromFile);

export default router;