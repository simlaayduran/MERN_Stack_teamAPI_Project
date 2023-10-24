import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Professor from "../models/Professor";
import Course from "../models/Course";
import User from "../models/User";
import { parse } from 'csv-string';

// @Desc Get all Profs
// @Route /api/prof
// @Method GET
export const getAllProfs = asyncHandler(async (req: Request, res: Response) => {
  const profs = await Professor.find({});
  res.status(200).json({  
        profs  
    });
});


// @Desc Save multiple profs
// @Route /api/prof/upload
// @Method POST
export const registerProfFromFile = asyncHandler(async (req: Request, res: Response) => {
    const csv = req.file;
    if (csv) {
      const fileContent = parse(csv.buffer.toString('utf-8'));
      for (let record of fileContent) {
        const professorEmail = record[0];
        const courseNumber = record[3];
        let instructor = await User.findOne({ professorEmail }).select("-password");
        let course = await Course.findOne({ courseNumber });
        if (!instructor || !course) {
            res.status(404);
            console.log("Instructor or course not found in the database! Skipping row.");
        } else {
            const prof = new Professor({ 
                professor: instructor, 
                faculty: record[1], 
                department: record[2], 
                course: course 
            });
            await prof.save();
        }
      }
    } else {
      res.status(500);
      throw new Error("File upload unsuccessful.");
    }
    res.status(200).json({});
  });



// @Desc Add Professor
// @Route /api/prof/add
// @Method POST
export const addProfs = asyncHandler(async (req: Request, res: Response) => {
    const { professorEmail, faculty, department, courseNumber } = req.body;
    // Also think of the case when the email is not that of a prof, how can you handle it?
    let instructor = await User.findOne({ professorEmail }).select("-password");
    if (!instructor) {
        res.status(404);
        throw new Error("Instructor not found in the database! Add user and continue.");
    }

    let course = await Course.findOne({ courseNumber });
    if (!course) {
        res.status(404);
        throw new Error("Course not found in the database! Add course and continue.");
    }
  
    const prof = new Professor({ 
        professor: instructor, 
        faculty: faculty, 
        department: department, 
        course: course 
    });
    await prof.save();
    res.status(201).json({
        id: prof._id,
        instructor: prof.professor,
        faculty: prof.faculty,
        term: prof.department,
        course: prof.course,
    });
});