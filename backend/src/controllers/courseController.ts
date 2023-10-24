import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Course, { Term } from "../models/Course";
import User from "../models/User";
import { parse } from 'csv-string';

// @Desc Get the information of all available courses
// @Route /api/course
// @Method GET
export const getAllCourses = asyncHandler(async (req: Request, res: Response) => {
    const courses = await Course.find({});
    res.status(200).json({courses});
});

// @Desc Import multiple courses from a CSV file
// The expected import format is term_year [0], course_num [1], course_name [2], instructor_assigned_name [3]
// @Route /api/course/upload
// @Method POST
export const registerCourseFromFile = asyncHandler(async (req: Request, res: Response) => {
    const csv = req.file;
    if (csv) {
      const fileContent = parse(csv.buffer.toString('utf-8'));
      for (let record of fileContent) {
        const term = record[0].split(" ")[0];
        const year = record[0].split(" ")[1];

        // TODO Change this to rely on something more unique
        // Not great, but we'll do a look up for a matching first/last name for now
        let instructorFirstName = record[3].substring(0, record[3].indexOf(' '));
        let instructorLastName = record[3].substring(record[3].indexOf(' ') + 1);

        if (!instructorFirstName) {                
            res.status(404);
            console.log("Failed because instructor has no first name! Skipping row.");
        }
        else {
            // Find corresponding user from first and last name
            let filter = {
                $and: [
                    { firstName: instructorFirstName },
                    { lastName: instructorLastName },
                    { userType: { $in: ["prof"] } }
                ]
            };

            let courseInstructor = await User.findOne(filter).select("-password");
            if (!courseInstructor) {
                res.status(404);
                console.log("Failed to find instructor in database! Add instructor and continue. Skipping row.");
            }
            else {
                let filter = {
                    $and: [
                        { term: term },
                        { year: year },
                        { courseNumber: record[1] },
                        { courseInstructor: courseInstructor }
                    ]
                };

                let courseFound = await Course.findOne(filter);
                if (courseFound) {
                    res.status(500);
                    console.log("Course already exists in database! Skipping row.");
                }
                else {
                    const course = new Course({
                        courseName: record[2],
                        courseDesc: "No description.",
                        term: term,
                        year: year,
                        courseNumber: record[1],
                        courseInstructor: courseInstructor
                    });
                    course.save(); // can be made concurrent
                }
            }
        }
    }
    } else {
      res.status(500);
      throw new Error("File upload unsuccessful.");
    }
    res.status(200).json({});
});

// @Desc Import multiple course infos from a CSV file CourseQuota.csv
// The expected import format is term_year [0], course_num [1], course_type [2], course_name [3], instructor_name [4], course_enrollment_num [5], TA_quota [6].
// @Route /api/course/uploadInfo
// @Method POST
export const registerCourseInfoFromFile = asyncHandler(async (req: Request, res: Response) => {
    console.log("info: uploaded CourseQuota.csv for Import TAs tab.");
    const csv = req.file;
    if (csv) {
      const fileContent = parse(csv.buffer.toString('utf-8'));
      for (let record of fileContent) {
        const term = record[0].split(" ")[0];
        const year = record[0].split(" ")[1];

        // TODO Change this to rely on something more unique
        // Not great, but we'll do a look up for a matching first/last name for now
        let instructorFirstName = record[4].substring(0, record[4].indexOf(' '));
        let instructorLastName = record[4].substring(record[4].indexOf(' ') + 1);

        if (!instructorFirstName) {                
            res.status(404);
            console.log("Failed because instructor has no first name! Skipping row.");
        }
        else {
            // Find corresponding user from first and last name
            let filter = {
                $and: [
                    { firstName: instructorFirstName },
                    { lastName: instructorLastName },
                    { userType: { $in: ["prof"] } }
                ]
            };

            let courseInstructor = await User.findOne(filter).select("-password");
            if (!courseInstructor) {
                res.status(404);
                console.log("Failed to find instructor in database! Add instructor and continue. Skipping row.");
            }
            else {
                let filter = {
                    $and: [
                        { term: term },
                        { year: year },
                        { courseNumber: record[1] },
                        { courseInstructor: courseInstructor }
                    ]
                };

                let course = await Course.findOne(filter);
                if (!course)
                {
                    res.status(404);
                    console.log("Failed to find course in database! Add course and continue. Skipping row.");
                }
                else
                {
                    const update =
                    {
                        courseType: record[2],
                        courseEnrollmentNumber: record[5],
                        taQuota: record[6],
                        taToStudentQuota: parseFloat(record[5]) / parseFloat(record[6]) 
                    };

                    course = await Course.findOneAndUpdate(filter, update);
                }
            }
        }
    }
}
else {
    res.status(500);
    throw new Error("File upload unsuccessful.");
}
    res.status(200).json({});
});


// @Desc Add courses manually
// @Route /api/course/add
// @Method POST
export const addCourses = asyncHandler(async (req: Request, res: Response) => {
    const { courseName, courseDesc, term, year, courseNumber, username } = req.body;
    console.log(req.body);
    // Find corresponding user from username
    let filter = {
        $and: [
            { username: username },
            { userType: { $in: ["prof"] } }
        ]
    };

    let courseInstructor = await User.findOne(filter).select("-password");

    if (!courseInstructor) {
        res.status(404);
        console.log("Failed to find instructor in database! Add instructor and continue.");
    }
    else {
        let filter = {
            $and: [
                { term: term },
                { year: year },
                { courseNumber: courseNumber }
            ]
        };

        let courseFound = await Course.findOne(filter);
        if (courseFound) {
            const update =
            {
                courseName: courseName, 
                courseDesc: courseDesc, 
                courseInstructor: courseInstructor 
            };

            courseFound = await Course.findOneAndUpdate(filter, update);
            console.log("Course updated!");
            res.status(201).json({});
        }
        else {
            const course = new Course({ 
                courseName: courseName, 
                courseDesc: courseDesc, 
                term: term, 
                year: year, 
                courseNumber: courseNumber, 
                courseInstructor: courseInstructor 
            });
            await course.save();
        
            console.log("Course created!");
            res.status(201).json({
                id: course._id,
                courseName: course.courseName,
                courseDesc: course.courseDesc,
                term: course.term,
                year: course.year,
                courseNumber: course.courseNumber,
                instructor: course.courseInstructor
            });
        }
    }
});


// @Desc Get professors
// @Route /api/course/profs
// @Method GET
export const getProfs = asyncHandler(async (req: Request, res: Response) => {
    console.log("info: requested list of users with Prof permissions, abbreviated.");
    
    let filter = {
      userType: { $in: ["prof"] } 
    };
  
    const projection = { 
        username: 0, password: 0, userType: 0, studentID: 0, verified: 0,  
    };
  
    const profs = await User.find(filter, projection);

    var output = [];
    
    for await (const doc of profs) {
      let courses = await Course.find({courseInstructor: doc._id}); 
      let parsed = [];
      for await (const docc of courses)
      {
        if (docc)
        {
          parsed.push(docc.courseNumber + " (" + docc.term + " " + docc.year + "), ");
        }
      }

      if (parsed.length == 1)
      {
        let last = parsed[0];
        last = last.replace(",", "");
        parsed[0] = last;
      }
      else if (parsed.length > 1)
      {
        let last = parsed[parsed.length - 1];
        console.log(last);
        last = last.replace(",", "");
        parsed[parsed.length - 1] = last;
      }
      
      const thisProfInfo = 
      {
          "firstName": doc.firstName,
          "lastName": doc.lastName,
          "email": doc.email,
          "courses": parsed
      };
  
      output.push(thisProfInfo);
    }
    
    res.status(200).json({  
        output  
    });
  });
  

// @Desc Add course information manually
// @Route /api/course/addInfo
// @Method POST
export const addCourseInfo = asyncHandler(async (req: Request, res: Response) => {
    const { courseName, courseDesc, term, year, courseNumber, instructorEmail, courseEnrollmentNumber, taQuota, courseType } = req.body;
    
    // Find corresponding user from email
    let filter = {
        $and: [
            { email: instructorEmail },
            { userType: { $in: ["prof"] } }
        ]
    };

    let courseInstructor = await User.findOne(filter).select("-password");
    if (!courseInstructor) {
        res.status(404);
        console.log("Failed to find instructor in database! Add instructor and continue.");
    }
    else {
        let filter = {
            $and: [
                { term: term },
                { year: year },
                { courseNumber: courseNumber }
            ]
        };

        let course = await Course.findOne(filter);
        if (!course) {
            res.status(404);
            console.log("Failed to find course in database! Add course and continue.");
        }
        else {
            const update = {
                courseType: courseType,
                courseEnrollmentNumber: courseEnrollmentNumber,
                taQuota: taQuota,
                taToStudentQuota: (parseFloat(courseEnrollmentNumber) / parseFloat(taQuota)) 
            };

            let uCourse = await Course.findOneAndUpdate(filter, update, {returnDocument: "after"});
            // TODO Return more here?
            res.status(200).json({});
        }
    }
});

// @Desc Add user to course
// @Route /api/course/assignStudent
// @Method POST
export const assignStudentToCourse = asyncHandler(async (req: Request, res: Response) => {
    const { username, term, year, courseNumber } = req.body;
    
    // TODO Decide on email or username
    // Find corresponding user from username
    let filter = {
        $and: [
            { username: username },
            { userType: { $in: ["stud"] } }
        ]
    };

    let userToAdd = await User.findOne(filter).select("-password");
    if (!userToAdd) {
        res.status(404);
        throw new Error("Failed to find user in database! Add user and continue");
    }
    else {
        let filter = {
            $and: [
                { term: term },
                { year: year },
                { courseNumber: courseNumber }
            ]
        };

        let course = await Course.findOne(filter);
        if (!course) {
            res.status(404);
            throw new Error("Course not found in the database! Add course and continue.");
        }
        else
        {
            let filterErr = {
                $and: [
                    { term: term },
                    { year: year },
                    { courseNumber: courseNumber },
                    { tasAssignedTo: userToAdd}
                ]
            };
            let courseErr = await Course.findOne(filterErr);

            if (courseErr) {
                res.status(404);
                throw new Error("Failed to add student to course! Cannot sign-up to course as student for which you are registered in as a TA.");
            }

            const update = {
                $addToSet: { studentsAssignedTo: [userToAdd] }
            };

            let course = await Course.findOneAndUpdate(filter, update);
            
            res.status(200).json({});
        }
    }
});

// @Desc Add user to course
// @Route /api/course/assignStudent
// @Method POST
export const assignStudentsToCourse = asyncHandler(async (req: Request, res: Response) => {
    const { usernames, term, year, courseNumber } = req.body;
    
    // TODO Decide on email or username
    // Find corresponding user from username
    let ls = usernames.split(",");

    console.log(usernames);
    for (let i = 0; i < usernames.length; i++)
    {
        let uname = ls[i].replace(/[,' ']+/g, "").trim();
        console.log(uname);
        let filter = {
            $and: [
                { username: uname },
                { userType: { $in: ["stud"] } }
            ]
        };
    
        let userToAdd = await User.findOne(filter).select("-password");
        if (!userToAdd) {
            res.status(404);
            throw new Error("Failed to find user in database! Add user and continue");
        }
        else {
            let filter = {
                $and: [
                    { term: term },
                    { year: year },
                    { courseNumber: courseNumber }
                ]
            };
    
            let course = await Course.findOne(filter);
            if (!course) {
                res.status(404);
                throw new Error("Course not found in the database! Add course and continue.");
            }
            else
            {
                let filterErr = {
                    $and: [
                        { term: term },
                        { year: year },
                        { courseNumber: courseNumber },
                        { tasAssignedTo: userToAdd}
                    ]
                };
                let courseErr = await Course.findOne(filterErr);
    
                if (courseErr) {
                    res.status(404);
                    throw new Error("Failed to add student to course! Cannot sign-up to course as student for which you are registered in as a TA.");
                }
    
                const update = {
                    $addToSet: { studentsAssignedTo: [userToAdd] }
                };
    
                let course = await Course.findOneAndUpdate(filter, update);
                console.log("added")
                res.status(200).json({});
            }
        }
    }

    
});

// @Desc Add user to course
// @Route /api/course/assignTA
// @Method POST
export const assignTAToCourse = asyncHandler(async (req: Request, res: Response) => {
    const { username, term, year, courseNumber } = req.body;
    
    // TODO Decide on email or username
    // Find corresponding user from username
    let filter = {
        $and: [
            { username: username },
            { userType: { $in: ["ta"] } }
        ]
    };

    let userToAdd = await User.findOne(filter).select("-password");
    if (!userToAdd) {
        res.status(404);
        throw new Error("Failed to find user in database! Add user and continue");
    }
    else {
        let filter = {
            $and: [
                { term: term },
                { year: year },
                { courseNumber: courseNumber }
            ]
        };

        let course = await Course.findOne(filter);
        if (!course) {
            res.status(404);
            throw new Error("Course not found in the database! Add course and continue.");
        }
        else
        {

            let filterErr = {
                $and: [
                    { term: term },
                    { year: year },
                    { courseNumber: courseNumber },
                    { studentsAssignedTo: userToAdd}
                ]
            };
            let courseErr = await Course.findOne(filterErr);

            if (courseErr) {
                res.status(404);
                throw new Error("Failed to add TA to course! Cannot TA course for which you are registered in as a student.");
            }

            const update = {
                $addToSet: { tasAssignedTo: [ userToAdd ]}
            };
            console.log("USER TO ADD (TA) : " + userToAdd);

            let course = await Course.findOneAndUpdate(filter, update);
            
            // TODO Return more here?
            res.status(200).json({});
        }
    }
});


// @Desc Remove user to course
// @Route /api/course/removeTA
// @Method POST
export const removeTAFromCourse = asyncHandler(async (req: Request, res: Response) => {
    console.log("REMOVING TA TO COURSE WORKING");
    const { username, term, year, courseNumber } = req.body;
    
    // TODO Decide on email or username
    // Find corresponding user from username
    let filter = {
        $and: [
            { username: username },
            { userType: { $in: ["ta"] } }
        ]
    };

    let userToRemove = await User.findOne(filter).select("-password");
    if (!userToRemove) {
        res.status(404);
        throw new Error("Failed to find user in database! Add user and continue");
    }
    else {
        let filter = {
            $and: [
                { term: term },
                { year: year },
                { courseNumber: courseNumber }
            ]
        };

        let course = await Course.findOne(filter);
        if (!course) {
            res.status(404);
            throw new Error("Course not found in the database! Add course and continue.");
        }
        else
        {

            let filterErr = {
                $and: [
                    { term: term },
                    { year: year },
                    { courseNumber: courseNumber },
                    { studentsAssignedTo: userToRemove}
                ]
            };
            let courseErr = await Course.findOne(filterErr);

            if (courseErr) {
                res.status(404);
                throw new Error("Failed to add TA to course! Cannot TA course for which you are registered in as a student.");
            }

            const update = {
                $pull: { tasAssignedTo: userToRemove._id}
            };
            console.log("USER TO remove (TA) : " + userToRemove);

            let course = await Course.findOneAndUpdate(filter, update, {new: true});
            console.log(course);
            
            // TODO Return more here?
            res.status(200).json({});
        }
    }
});

// @Desc Delete Course
// @Route /api/course/:id
// @Method DELETE
export const deleteCourse = asyncHandler(async (req: Request, res: Response) => {
    const { term, year, courseNumber } = req.body;

    const filter = {
        $and: [
            { term: term },
            { year: year },
            { courseNumber: courseNumber }
        ]
    };

    let course = await Course.findOne(filter);
    if (!course) {
        res.status(404);
        throw new Error("Course not found in the database! Add course and continue.");
    }
    else
    {
        await Course.findOneAndDelete(filter);
        res.status(201).json({});
    }
})