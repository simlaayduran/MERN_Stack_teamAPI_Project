import express from 'express';
import { getAllCourses, addCourses, getProfs, addCourseInfo, assignStudentsToCourse, assignStudentToCourse, assignTAToCourse, registerCourseFromFile, registerCourseInfoFromFile, deleteCourse, removeTAFromCourse} from '../controllers/courseController';
import multer from "multer";
const upload = multer();

const router = express.Router();

router.route("/").get(getAllCourses);
router.route("/add").post(addCourses);
router.route("/addInfo").post(addCourseInfo);
router.route("/assignStudent").post(assignStudentToCourse);
router.route("/assignStudents").post(assignStudentsToCourse);
router.route("/assignTA").post(assignTAToCourse);
router.route("/removeTA").post(removeTAFromCourse);
router.route("/upload").post(upload.single("csvFile"), registerCourseFromFile);
router.route("/uploadInfo").post(upload.single("csvFile"), registerCourseInfoFromFile);
router.route("/delete").post(deleteCourse);
router.route("/profs").get(getProfs);

export default router;