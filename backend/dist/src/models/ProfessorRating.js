"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const ProfessorRatingSchema = new mongoose_1.default.Schema({
    username_prof: {
        type: String,
        required: true,
    },
    username_ta: {
        type: String,
        required: true,
    },
    courseNumber: {
        type: String,
        required: true,
    },
    term: {
        type: String,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});
const ProfessorRating = mongoose_1.default.model("ProfessorRating", ProfessorRatingSchema);
exports.default = ProfessorRating;
