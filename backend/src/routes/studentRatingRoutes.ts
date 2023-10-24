import express from 'express';
import {getAllStudentRatings, getAllStudentRatingsByUser, getAllStudentRatingsForUser, studentRateTa } from '../controllers/studentRatingController';
import multer from "multer";
const upload = multer();
const router = express.Router();

router.route("/").get(getAllStudentRatings);
router.route("/all").get(getAllStudentRatingsForUser);
router.route("/for").get(getAllStudentRatingsByUser);
router.route("/rateTA").post(studentRateTa);

export default router;