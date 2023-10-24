import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Course from "../models/Course";
import User from "../models/User";
import StudentRating from "../models/StudentRating";


// @Desc Get all TA ratings for specific rater (the one who asked)
// @Route /api/studentRating
// @Method GET
export const getAllStudentRatings = asyncHandler(async (req: Request, res: Response) => {
    const url = req.url;
    var splittedUrl = url.split("=");
    const username_stud = splittedUrl[1];

    //Find all TA ratings created by student w. username =  username_stud
    let filter = {
        $and: [
            { username_stud: username_stud },
        ]
    };

    const studentRatings = await StudentRating.find(filter);
    res.status(200).json({
        studentRatings
    });
  });

  // @Desc Get all TA ratings for specific rater (the one who asked)
// @Route /api/studentRating/all
// @Method GET
export const getAllStudentRatingsForUser = asyncHandler(async (req: Request, res: Response) => {
    const url = req.url;
    var splittedUrl = url.split("=");
    console.log(splittedUrl);
    var splittedArgs = splittedUrl[1].split("&");
    console.log(splittedArgs);
    const username_ta = splittedArgs[0];
    const term = splittedArgs[1];
    const year = splittedArgs[2];
    console.log(term, year, username_ta)

    //Find all TA ratings created by student w. username =  username_stud
    let filter = {
        $and: [
            { username_ta: username_ta },
            { term: term },
            { year: year },
        ]
    };

    const studentRatings = await StudentRating.find(filter);
    res.status(200).json({
        studentRatings
    });
  });

  
// @Desc Get all TA ratings for specific rater (the one who asked)
// @Route /api/studentRating/for
// @Method GET
export const getAllStudentRatingsByUser = asyncHandler(async (req: Request, res: Response) => {
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

    const studentRatings = await StudentRating.find(filter);
    console.log(studentRatings);
    res.status(200).json({
        studentRatings
    });
  });


// @Desc Add student rating entry
// @Route /api/studentRating/rateTA
// @Method POST
export const studentRateTa = asyncHandler(async (req: Request, res: Response) => {
    const {username_stud, username_ta, courseNumber, term, year, rating, comment} = req.body;
    
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

    let userStud= await User.findOne(filterStud).select("-password");
    let userTA= await User.findOne(filterTA).select("-password");

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

        let course = await Course.findOne(filterCourse);

        if (!course) {
            res.status(404);
            throw new Error("Course not found in the database! Make sure course is added to continue.");
        }

        else
        {
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

            let studentRatingFound = await StudentRating.findOne(filterStudentRating);

            if(studentRatingFound) {
                res.status(409);
                throw new Error("TA rating by student already exists for this term, year & course number (1 permitted per student).");
            }
            else{
                //Add student rating of TA
                const addStudentRating = new StudentRating({
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
});







