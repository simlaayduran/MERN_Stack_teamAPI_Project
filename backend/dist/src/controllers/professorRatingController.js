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
exports.professorRateTa = exports.getAllProfessorRatingsByUser = exports.getAllProfessorRatingsForUser = exports.getAllProfessorRatings = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Course_1 = __importDefault(require("../models/Course"));
const User_1 = __importDefault(require("../models/User"));
const ProfessorRating_1 = __importDefault(require("../models/ProfessorRating"));
// @Desc Get all professor ratings for specific rater (the one who asked)
// @Route /api/professorRating
// @Method GET
exports.getAllProfessorRatings = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const url = req.url;
    var splittedUrl = url.split("=");
    const username_prof = splittedUrl[1];
    //Find all TA ratings created by student w. username =  username_stud
    let filter = {
        $and: [
            { username_prof: username_prof },
        ]
    };
    const professorRatings = yield ProfessorRating_1.default.find(filter);
    res.status(200).json({
        professorRatings
    });
}));
// @Desc Get all TA ratings for specific rater (the one who asked)
// @Route /api/studentRating/all
// @Method GET
exports.getAllProfessorRatingsForUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const url = req.url;
    var splittedUrl = url.split("=");
    console.log(splittedUrl);
    var splittedArgs = splittedUrl[1].split("&");
    console.log(splittedArgs);
    const username_prof = splittedArgs[0];
    const term = splittedArgs[1];
    const year = splittedArgs[2];
    console.log(term, year, username_prof);
    //Find all TA ratings created by student w. username =  username_stud
    let filter = {
        $and: [
            { username_prof: username_prof },
            { term: term },
            { year: year },
        ]
    };
    const professorRatings = yield ProfessorRating_1.default.find(filter);
    res.status(200).json({
        professorRatings
    });
}));
// @Desc Get all TA ratings for specific rater (the one who asked)
// @Route /api/professorRating/for
// @Method GET
exports.getAllProfessorRatingsByUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const professorRatings = yield ProfessorRating_1.default.find(filter);
    console.log("prof rating:", professorRatings);
    res.status(200).json({
        professorRatings
    });
}));
// @Desc Add professor rating entry
// @Route /api/professorRating/rateTA
// @Method POST
exports.professorRateTa = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username_prof, username_ta, courseNumber, term, year, comment } = req.body;
    // Find corresponding user from username (for both prof and TA)
    let filterProf = {
        $and: [
            { username: username_prof },
            { userType: { $in: ["prof", "stud", "ta"] } }
        ]
    };
    let filterTA = {
        $and: [
            { username: username_ta },
            { userType: { $in: ["prof", "stud", "ta"] } }
        ]
    };
    let userProf = yield User_1.default.findOne(filterProf).select("-password");
    let userTA = yield User_1.default.findOne(filterTA).select("-password");
    if (!userProf) {
        console.log("Failed to find professor user in database! Make sure user is registered to continue");
        res.status(404);
        throw new Error("Failed to find professor user in database! Make sure user is registered to continue");
    }
    if (!userTA) {
        console.log("Failed to find TA user in database! Make sure TA is registered to continue");
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
            console.log("Course not found in the database! Make sure course is added to continue.");
            res.status(404);
            throw new Error("Course not found in the database! Make sure course is added to continue.");
        }
        else {
            //We allow multiple comments by the same professor for the same [TA, course num, term & year].
            const addProfessorRating = new ProfessorRating_1.default({
                username_prof: username_prof,
                username_ta: username_ta,
                courseNumber: courseNumber,
                term: term,
                year: year,
                comment: comment
            });
            addProfessorRating.save();
            res.status(201).json({});
        }
    }
}));
