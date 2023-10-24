import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Course from "../models/Course";
import User from "../models/User";
import ProfessorRating from "../models/ProfessorRating";


// @Desc Get all professor ratings for specific rater (the one who asked)
// @Route /api/professorRating
// @Method GET
export const getAllProfessorRatings = asyncHandler(async (req: Request, res: Response) => {
    const url = req.url;
    var splittedUrl = url.split("=");
    const username_prof = splittedUrl[1];

    //Find all TA ratings created by student w. username =  username_stud
    let filter = {
        $and: [
            { username_prof: username_prof },
        ]
    };

    const professorRatings = await ProfessorRating.find(filter);
    res.status(200).json({
        professorRatings
    });
  });

  
// @Desc Get all TA ratings for specific rater (the one who asked)
// @Route /api/studentRating/all
// @Method GET
export const getAllProfessorRatingsForUser = asyncHandler(async (req: Request, res: Response) => {
    const url = req.url;
    var splittedUrl = url.split("=");
    console.log(splittedUrl);
    var splittedArgs = splittedUrl[1].split("&");
    console.log(splittedArgs);
    const username_prof = splittedArgs[0];
    const term = splittedArgs[1];
    const year = splittedArgs[2];
    console.log(term, year, username_prof)

    //Find all TA ratings created by student w. username =  username_stud
    let filter = {
        $and: [
            { username_prof: username_prof },
            { term: term },
            { year: year },
        ]
    };

    const professorRatings = await ProfessorRating.find(filter);
    res.status(200).json({
        professorRatings
    });
  });

// @Desc Get all TA ratings for specific rater (the one who asked)
// @Route /api/professorRating/for
// @Method GET
export const getAllProfessorRatingsByUser = asyncHandler(async (req: Request, res: Response) => {
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

    const professorRatings = await ProfessorRating.find(filter);
    console.log("prof rating:", professorRatings);
    res.status(200).json({
        professorRatings
    });
  });


// @Desc Add professor rating entry
// @Route /api/professorRating/rateTA
// @Method POST
export const professorRateTa = asyncHandler(async (req: Request, res: Response) => {
    const {username_prof, username_ta, courseNumber, term, year, comment} = req.body;
    
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

    let userProf= await User.findOne(filterProf).select("-password");
    let userTA= await User.findOne(filterTA).select("-password");

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

        let course = await Course.findOne(filterCourse);

        if (!course) {
            console.log("Course not found in the database! Make sure course is added to continue.")
            res.status(404);
            throw new Error("Course not found in the database! Make sure course is added to continue.");
        }

        else
        { 
            //We allow multiple comments by the same professor for the same [TA, course num, term & year].
            const addProfessorRating = new ProfessorRating({
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
});







