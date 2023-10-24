import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Course from "../models/Course";
import User from "../models/User";
import TA from "../models/TA";
import TAwishlist from "../models/TAwishlist";
import { parse } from 'csv-string';

// @Desc Get all TAs
// @Route /api/ta/
// @Method GET
export const getAllTAUsers = asyncHandler(async (req: Request, res: Response) => {
    console.log("info: requested list of users with TA permissions, abbreviated.");
    const projection = { _id: 0, password: 0, createdAt: 0, updatedAt: 0, userType: 0, verified: 0, __v: 0 };

    let filter = {
        userType: { $in: ["ta"] } 
    };
    const users = await User.find(filter, projection);
    res.status(200).json({  
        users  
    });
});

// @Desc Get all courses assigned to a specific TA for the term and year
// @Route /api/ta/courseForTA
// @Method POST
export const getAllCoursesForTA = asyncHandler(async (req: Request, res: Response) => {
    console.log("info: requested list of courses assigned to a specific TA.");
    const { term, year, username } = req.body;
    
    const ta = await User.findOne({username: username});
    const filter = {
        $and: [
            { term: term },
            { year: year },
            { tasAssignedTo: ta }
        ]
    };

    const courses = await Course.find(filter);

    res.status(200).json({ courses });
});

// @Desc Get important course info to display
// @Route /api/ta/impDisplayInfo
// @Method POST
export const getCourseInfoForImpDisplay = asyncHandler(async (req: Request, res: Response) => {
    console.log("info: requested course information to display for Import TAs tab.");
    const { term, year } = req.body;

    const filter = {
        $and: [
            { term: term },
            { year: year }
        ]
    };

    const projection = { 
        _id: 0, courseNumber: 1, courseName: 1, term: 1, year: 1, courseInstructor: 1, courseType: 1, taToStudentQuota: 1, tasAssignedTo: 1, studentsAssignedTo: 1 
    };

    var output = [];

    const cursor = await Course.find( 
        { $and: [
            { term: term },
            { year: year }
        ]},
        { 
            _id: 0, courseNumber: 1, courseName: 1, term: 1, year: 1, courseInstructor: 1, courseType: 1, taToStudentQuota: 1, tasAssignedTo: 1, studentsAssignedTo: 1 
        }
    );

    let out = [];
    for await (const doc of cursor) {
        let instructor = await User.findOne(doc.courseInstructor._id); 
        if (instructor)
        {
            const instructorName = instructor.firstName + " " + instructor.lastName;
            const taToStudentQuotaCurrent = doc.studentsAssignedTo.length / (doc.tasAssignedTo.length === 0 ? 1 : doc.tasAssignedTo.length);
            
            const thisCourseInfo = 
            {
                "courseName": doc.courseName,
                "courseNumber": doc.courseNumber,
                "courseInstructor": instructorName,
                "courseType": (doc.courseType ? doc.courseType : "N/A"),
                "taToStudentQuota": (doc.taToStudentQuota ? doc.taToStudentQuota : "N/A"),
                "taToStudentQuotaCurrent": taToStudentQuotaCurrent
            };

            if ((doc.taToStudentQuota && doc.taToStudentQuota < 30 || doc.taToStudentQuota > 45) || (taToStudentQuotaCurrent < 30 || taToStudentQuotaCurrent > 45))
            {
                out.push(thisCourseInfo);
            }
        }
    }

    res.status(200).json({ out });
});

// @Desc Import multiple courses from a CSV file
// The expected import format is term_year [0], TA_name [1], student_ID [2], legal_name [3], 
// email [4], grad_ugrad [5], supervisor_name [6], priority(yes/no) [7], hours(90/180) [8], 
// date_applied [9], location [10], phone [11], degree [12], courses_applied_for_list [13], 
// open_to_other_courses(yes/no) [14], notes [15]
// @Route /api/ta/upload
// @Method POST
export const registerTAFromFile = asyncHandler(async (req: Request, res: Response) => {
    console.log("info: uploaded TACohort.csv for Import TAs tab.");
    const csv = req.file;
    if (csv) {
        const fileContent = parse(csv.buffer.toString('utf-8'));
        for (let record of fileContent) {
            const term = record[0].split(" ")[0];
            const year = record[0].split(" ")[1];

            // TODO Discuss this
            // Not great, but we'll do a look up for a matching first/last name and email for now
            const taFirstName = record[1].substring(0, record[1].indexOf(' '));
            const taLastName = record[1].substring(record[1].indexOf(' ') + 1);
            console.log("/"+taFirstName+"/", "/"+taLastName+"/");

            if (!taFirstName) {
                res.status(404);
                console.log("TA has no first name! Skipping row.");
            } 
            else {
                // Find corresponding TA user from first name, last name, and email
                let filter = {
                    $and: [
                        { firstName: taFirstName },
                        { lastName: taLastName },
                        { email: record[4] },
                        { userType: { $in: ["ta"] } }
                    ]
                };

                let ta = await User.findOne(filter).select("-password");
                if (!ta) {
                    res.status(404);
                    console.log("Failed to find user in database! Skipping row.");
                }
                else {
                    let coursesAppliedToParse = [];
                    // Finally, double check if a record for the term_year already exists for this user
                    if (ta && ta.studentID && ta.studentID != parseInt(record[2])) {
                        res.status(404);
                        console.log("Failed to find match for user property in database! Skipping row.");
                    }
                    else
                    {
                        let coursesAppliedToSplit = record[13].split(" ");
                        console.log(record[13]);
                        
                        for (const c of coursesAppliedToSplit)
                        {
                            // Trim all commas and whitespace
                            let current = c.replace(/[,' ']+/g, "").trim();
                            // Add back in a single space 
                            current = current.replace(/(\D)(\d)/, "$1 $2");	
                            console.log("/"+current+"/");
                            let filter = {
                                $and: [
                                    { term: term },
                                    { year: year },
                                    { courseNumber: current }
                                ]
                            };
            
                            let matchingCourse = await Course.findOne(filter);
                            if (!matchingCourse) {
                                console.log("Failed to find match for course in database! Ignoring...");
                            } else {
                                // Add the matching course
                                coursesAppliedToParse.push(matchingCourse._id);
                            }
                        }
                    }

                    console.log(ta.username);
                    // Update the database
                    const newTA = new TA({
                        username: ta.username,
                        term: term,
                        year: year,
                        supervisorName: record[6],
                        isGrad: (record[5] === "grad" ? true : false),
                        priorityForCourses: (record[7] === "yes" ? true : false),
                        dateApplied: record[9],
                        location: record[10],
                        phone: record[11],
                        degree: record[12],
                        coursesAssignedTo: [],
                        coursesAppliedTo: coursesAppliedToParse,
                        hours: record[8],
                        openToOtherCourses: (record[14] === "yes" ? true : false),
                        notes: record[15]
                    });
                    await newTA.save();
                    console.log("success");
                }
            }
        }
        res.status(200);
    }
    else {
        res.status(500);
        throw new Error("File upload unsuccessful.");
    }
    
    // TODO Return relevant info here
    res.status(201).json({});
});

// @Desc Add TAs manually
// @Route /api/ta/add
// @Method POST
export const addTA = asyncHandler(async (req: Request, res: Response) => {
    const { term, year, username, studentID, isGrad, supervisorName, 
        priorityForCourses, hours, dateApplied, location, phone, degree, 
        coursesAppliedTo, openToOtherCourses, notes } = req.body;
        
    // Find corresponding TA user
    let filter = {
        $and: [
            { username: username },
            { userType: { $in: ["ta"] } }
        ]
    };

    let ta = await User.findOne(filter).select("-password");
    if (!ta) {
        res.status(404);
        console.log("Failed to find user in database! Skipping row.");
    }
    else {
        // If the retrieved user has a student ID present, make sure it matches the TA's student ID
        let filter = { 
            $and: [
                { username: username },
                { userType: { $in: ["ta"] } },
                {$eq: [ { $getField: "studentID" }, studentID ] }
            ]
        };

        let ta2 = await User.findOne(filter).select("-password");

        if (ta2 && ta2.studentID && ta2.studentID != parseInt(studentID)) {
            res.status(404);
            console.log("Failed to find match for user property in database! Skipping row.");
        }
        else
        {
            let coursesAppliedToSplit = coursesAppliedTo.split(" ");
            console.log(coursesAppliedTo);
            let coursesAppliedToParse = [];
            for (const c of coursesAppliedToSplit)
            {
                // Trim all commas and whitespace
                let current = c.replace(/[,' ']+/g, "").trim();
                // Add back in a single space 
                current = current.replace(/(\D)(\d)/, "$1 $2");	
                console.log(current);
                let filter = {
                    $and: [
                        { term: term },
                        { year: year },
                        { courseNumber: current }
                    ]
                };

                let matchingCourse = await User.findOne(filter);
                if (!matchingCourse) {
                    console.log("Failed to find match for course in database! Ignoring...");
                } else {
                    // Add the matching course
                    coursesAppliedToParse.push(matchingCourse._id);
                }
            }

            // Finally, double check if a record for the term_year already exists for this user
            const filter2 = { 
                $and: [
                    { term: term },
                    { year: year },
                    { username: username }
                ]
            };
            
            let taRecord = await TA.findOne(filter2);

            if (taRecord)
            {
                // Update the database
                const update = {
                    supervisorName: supervisorName,
                    isGrad: isGrad,
                    priorityForCourses: priorityForCourses,
                    dateApplied: dateApplied,
                    location: location,
                    phone: phone,
                    degree: degree,
                    coursesAssignedTo: [],
                    coursesAppliedTo: coursesAppliedToParse,
                    hours: hours,
                    openToOtherCourses: openToOtherCourses,
                    notes: notes
                };

                let taRecord = await TA.findOneAndUpdate(filter2, update);
          
                res.status(200).json({});
            }
            else {
                // Update the database
                const newTA = new TA({
                    username: ta.username,
                    term: term,
                    year: year,
                    supervisorName: supervisorName,
                    isGrad: isGrad,
                    priorityForCourses: priorityForCourses,
                    dateApplied: dateApplied,
                    location: location,
                    phone: phone,
                    degree: degree,
                    coursesAssignedTo: [],
                    coursesAppliedTo: coursesAppliedToParse,
                    hours: hours,
                    openToOtherCourses: openToOtherCourses,
                    notes: notes
                });
                await newTA.save();

                res.status(201).json({});
            }
        }
        
    }
});

// @Desc Delete TA history
// @Route /api/ta/delete
// @Method DELETE
export const deleteTA = asyncHandler(async (req: Request, res: Response) => {
    const { term, year, username } = req.body;

    const filter = {
        $and: [
            { term: term },
            { year: year },
            { username: username }
        ]
    };

    let taRecord = await TA.findOne(filter);
    if (!taRecord) {
        res.status(404);
        throw new Error("TA not found in the database! Add TA and continue.");
    }
    else
    {
        await TA.findOneAndDelete(filter);
        res.status(201).json({});
    }
});

// @Desc Add TA to Wishlist
// @Route /api/ta/addToWishlist
// @Method POST
export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
    console.log(req.body);
    //Wishlist info inside wishlist database by TA object ID 
    let filter = {
        username_prof: req.body.username_prof,
        username_ta: req.body.username_ta, 
        courseNumber: req.body.courseNumber,  
        term: req.body.term,
        year: req.body.year
    };
    let wish = await TAwishlist.findOne(filter);
    console.log(wish);
    if (wish)
    {
        console.log("Already exists!");
        res.status(500);
    }
    else
    {
        let ta = await User.findOne( { username: req.body.username_ta });
        let course = await Course.findOne( {term: req.body.term, year: req.body.year, courseNumber: req.body.courseNumber});
        if (course)
        {
            if (ta)
            {
                console.log("Added wishlist!");
                const newTA = new TAwishlist({
                    username_prof: req.body.username_prof,
                    username_ta: req.body.username_ta, 
                    courseNumber: req.body.courseNumber,  
                    term: req.body.term,
                    year: req.body.year,
                    info: req.body.info
                });
                await newTA.save();
                res.status(200).json({ })
            }
            else {
                console.log("Could not find TA user");
                res.status(404);
            }
        } else {
            console.log("Could not find course");
            res.status(404);
        }
    }
});

// @Desc Add TA to Wishlist
// @Route /api/ta/wishlisted
// @Method GET
export const wishlisted = asyncHandler(async (req: Request, res: Response) => { 
    // Find Wishlist Info inside Wishlist database by TA Id , ProfFrom 
    let filter = {
        username_prof: req.body.username_prof
    };
    let wishes = await TAwishlist.find(filter);

    let wishesPretty = [];
    for (const c of wishes)
    {
        let ta = await User.findOne({username: c.username_ta});
        let prof = await User.findOne({username: c.username_prof});
        if (prof)
        {
            if (ta)
            {
                let item = {
                    username_prof: prof.firstName + " " + prof.lastName,
                    username_ta: ta.firstName + " " + ta.lastName,
                    courseNumber: c.courseNumber,
                    term: c.term,
                    year: c.year,
                    info: c.info,
                  }
                wishesPretty.push(item);
            }
            else
            {
                console.log("cannot find ta");
                res.status(404);
            }
        }
        else
        {
           console.log("cannot find prof");
           res.status(404);
        }
        
    }

    res.status(200).json({wishesPretty});
});


// @Desc Add TA to Wishlist
// @Route /api/ta/wishlistedSimple
// @Method POST
export const wishlistedSimple = asyncHandler(async (req: Request, res: Response) => { 
    // Find Wishlist Info inside Wishlist database by TA Id , ProfFrom 
    let filter = {
        term: req.body.term,
        year: req.body.year,
        username_ta: req.body.username_ta,
    };
    let wishes = await TAwishlist.find(filter);

    let wishesPretty = [];
    for (const c of wishes)
    {
        let ta = await User.findOne({username: c.username_ta});
        let prof = await User.findOne({username: c.username_prof});
        let course = await Course.findOne({courseNumber: c.courseNumber, term: c.term, year: c.year});
        if (prof)
        {
            if (ta)
            {
                if (course){

                
                let item = {
                    username_prof: prof.firstName + " " + prof.lastName,
                    username_ta: ta.firstName + " " + ta.lastName,
                    courseNumber: course.courseNumber,
                    courseName: course.courseName,
                    term: c.term,
                    year: c.year,
                    info: c.info,
                  }
                wishesPretty.push(item);
                }
                else
                {
                    console.log("cannot find course");
                    res.status(404);
                }
            }
            else
            {
                console.log("cannot find ta");
                res.status(404);
            }
        }
        else
        {
           console.log("cannot find prof");
           res.status(404);
        }
        
    }

    res.status(200).json({wishesPretty});
});

// @Desc Retrieve TA history - TA Cohort, student rating average, professor performance log, student rating comments, prof wish list membership, the courses they are currently assigned to TA this term
// @Route /api/ta/:e
// @Method GET
export const getHistoryEntryForTA = asyncHandler(async (req: Request, res: Response) => {
    const { term, year, username } = req.body;
    
    const filter = {
        $and: [
            { term: term },
            { year: year },
            { username: username }
        ]
    };
    const projection = { updatedAt: 0};

    // TODO: Begin to expand on the history returned - include comments
    // TA info, student rating average, professor performance log, student rating comments, 
    // prof wish list membership, the courses they are currently assigned to TA this term.
    const history = await TA.find(filter);
    console.log(history);
    res.status(200).json({ history });
});
