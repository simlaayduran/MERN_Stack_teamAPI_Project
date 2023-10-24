"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const studentRatingController_1 = require("../controllers/studentRatingController");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)();
const router = express_1.default.Router();
router.route("/").get(studentRatingController_1.getAllStudentRatings);
router.route("/all").get(studentRatingController_1.getAllStudentRatingsForUser);
router.route("/for").get(studentRatingController_1.getAllStudentRatingsByUser);
router.route("/rateTA").post(studentRatingController_1.studentRateTa);
exports.default = router;
