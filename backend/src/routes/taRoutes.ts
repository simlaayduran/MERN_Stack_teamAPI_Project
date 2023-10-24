import express from 'express';
import {getAllCoursesForTA, getAllTAUsers, registerTAFromFile, wishlistedSimple, addTA, deleteTA, wishlisted, getHistoryEntryForTA, getCourseInfoForImpDisplay, addToWishlist } from '../controllers/taController';
import multer from "multer";
const upload = multer();

const router = express.Router();
router.route("/courseForTA").post(getAllCoursesForTA);
router.route("/").get(getAllTAUsers);
router.route("/impDisplayInfo").post(getCourseInfoForImpDisplay);
router.route("/upload").post(upload.single("csvFile"), registerTAFromFile);
router.route("/add").post(addTA);
router.route("/delete").post(deleteTA);
router.route("/addToWishlist").post(addToWishlist);
router.route("/wishlisted").post(wishlisted);
router.route("/wishlistedSimple").post(wishlistedSimple);
router.route("/:e").post(getHistoryEntryForTA);


export default router;