"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentRateTa = exports.getAllStudentRatingsByUser = exports.getAllStudentRatingsForUser = exports.getAllStudentRatings = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Course_1 = __importDefault(require("../models/Course"));
const User_1 = __importDefault(require("../models/User"));
const StudentRating_1 = __importDefault(require("../models/StudentRating"));
// @Desc Get all TA ratings for specific rater (the one who asked)
// @Route /api/studentRating
// @Method GET
exports.getAllStudentRatings = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const url = req.url;
    var splittedUrl = url.split("=");
    const username_stud = splittedUrl[1];
    //Find all TA ratings created by student w. username =  username_stud
    let filter = {
        $and: [
            { username_stud: username_stud },
        ]
    };
    const studentRatings = yield StudentRating_1.default.find(filter);
    res.status(200).json({
        studentRatings
    });
}));
// @Desc Get all TA ratings for specific rater (the one who asked)
// @Route /api/studentRating/all
// @Method GET
exports.getAllStudentRatingsForUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const url = req.url;
    var splittedUrl = url.split("=");
    console.log(splittedUrl);
    var splittedArgs = splittedUrl[1].split("&");
    console.log(splittedArgs);
    const username_ta = splittedArgs[0];
    const term = splittedArgs[1];
    const year = splittedArgs[2];
    console.log(term, year, username_ta);
    //Find all TA ratings created by student w. username =  username_stud
    let filter = {
        $and: [
            { username_ta: username_ta },
            { term: term },
            { year: year },
        ]
    };
    const studentRatings = yield StudentRating_1.default.find(filter);
    res.status(200).json({
        studentRatings
    });
}));
// @Desc Get all TA ratings for specific rater (the one who asked)
// @Route /api/studentRating/for
// @Method GET
exports.getAllStudentRatingsByUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const url = req.url;
    var splittedUrl = url.split("&");
    console.log(splittedUrl);
    var splittedArgs = splittedUrl[0].split("=");
    console.log(splittedArgs);
    const username_ta = splittedArgs[1];
    splittedArgs = splittedUrl[1].split("=");
    console.log(splittedArgs);
    const term = splittedArgs[1];
    splittedArgs = splittedUrl[2].split("=");
    console.log(splittedArgs);
    const year = splittedArgs[1];
    console.log(term, year, username_ta);
    //Find all TA ratings created by student w. username =  username_stud
    let filter = {
        $and: [
            { username_ta: username_ta },
            { term: term },
            { year: year },
        ]
    };
    const studentRatings = yield StudentRating_1.default.find(filter);
    console.log(studentRatings);
    res.status(200).json({
        studentRatings
    });
}));
// @Desc Add student rating entry
// @Route /api/studentRating/rateTA
// @Method POST
exports.studentRateTa = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username_stud, username_ta, courseNumber, term, year, rating, comment } = req.body;
    // Find corresponding user from username (for both student and TA)
    let filterStud = {
        $and: [
            { username: username_stud },
            { userType: { $in: ["prof", "stud", "ta"] } }
        ]
    };
    let filterTA = {
        $and: [
            { username: username_ta },
            { userType: { $in: ["prof", "stud", "ta"] } }
        ]
    };
    let userStud = yield User_1.default.findOne(filterStud).select("-password");
    let userTA = yield User_1.default.findOne(filterTA).select("-password");
    if (!userStud) {
        res.status(404);
        throw new Error("Failed to find student user in database! Make sure user is registered to continue");
    }
    if (!userTA) {
        res.status(404);
        throw new Error("Failed to find TA user in database! Make sure TA is registered to continue");
    }
    else {
        //Find corresponding course
        let filterCourse = {
            $and: [
                { term: term },
                { year: year },
                { courseNumber: courseNumber }
            ]
        };
        let course = yield Course_1.default.findOne(filterCourse);
        if (!course) {
            res.status(404);
            throw new Error("Course not found in the database! Make sure course is added to continue.");
        }
        else {
            //Check if student has already rated TA for this course & term_year
            let filterStudentRating = {
                $and: [
                    { username_stud: username_stud },
                    { username_ta: username_ta },
                    { courseNumber: courseNumber },
                    { term: term },
                    { year: year }
                ]
            };
            let studentRatingFound = yield StudentRating_1.default.findOne(filterStudentRating);
            if (studentRatingFound) {
                res.status(409);
                throw new Error("TA rating by student already exists for this term, year & course number (1 permitted per student).");
            }
            else {
                //Add student rating of TA
                const addStudentRating = new StudentRating_1.default({
                    username_stud: username_stud,
                    username_ta: username_ta,
                    courseNumber: courseNumber,
                    term: term,
                    year: year,
                    rating: rating,
                    comment: comment
                });
                addStudentRating.save();
            }
            res.status(201).json({});
        }
    }
}));
