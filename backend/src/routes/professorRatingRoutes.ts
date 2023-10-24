import express from 'express';
import {getAllProfessorRatings, professorRateTa, getAllProfessorRatingsByUser, getAllProfessorRatingsForUser } from '../controllers/professorRatingController';
import multer from "multer";
const upload = multer();
const router = express.Router();

router.route("/").get(getAllProfessorRatings);
router.route("/all").get(getAllProfessorRatingsForUser);
router.route("/for").get(getAllProfessorRatingsByUser);
router.route("/rateTA").post(professorRateTa);

export default router;