"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const professorRatingController_1 = require("../controllers/professorRatingController");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)();
const router = express_1.default.Router();
router.route("/").get(professorRatingController_1.getAllProfessorRatings);
router.route("/all").get(professorRatingController_1.getAllProfessorRatingsForUser);
router.route("/for").get(professorRatingController_1.getAllProfessorRatingsByUser);
router.route("/rateTA").post(professorRatingController_1.professorRateTa);
exports.default = router;
