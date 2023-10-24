import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/User";
import generateToken from "../utils/generateToken";
import { parse } from 'csv-string';
import { assignTAToCourse } from "./courseController";

// @Desc Get all users
// @Route /api/users
// @Method GET
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find({}).select("-password");
  res.status(200).json({  
      users  
    });
});


// @Desc Save multiple users
// @Route /api/users/upload
// @Method POST
export const registerUsersFromFile = asyncHandler(async (req: Request, res: Response) => {
  const csv = req.file;
  if (csv) {
    const fileContent = parse(csv.buffer.toString('utf-8'));
    for (let record of fileContent) {
      console.log(record);

      let filter = {
        $and: [
            { username: record[0] as string },
            { email: record[3] as string }
        ]
      };

      let userFound = await User.findOne(filter);
      if (userFound) {
          res.status(500);
          console.log("User already exists in database! Skipping row.");
      }
      else {
        const user = new User({
          username: record[0], 
          firstName: record[1],
          lastName: record[2],
          email: record[3],
          password: record[4],
          userType: record[5].split("/"),
          studentID: record[6],
          verified: (record[7] == "TRUE" ? true : false)
        });
        user.save(); // can be made concurrent
      }
    }
  } else {
    res.status(500);
    throw new Error("File upload unsuccessful.");
  }
  res.status(200).json({});
});


// @Desc Get User by ID
// @Route /api/users/:id
// @Method GET
export const getUserByID = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById({ _id: req.params.id }).select("-password");
  if(!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json({  
        user
    });
});


// @Desc Register User
// @Route /api/users/register
// @Method POST
export const register = asyncHandler(async (req: Request, res: Response) => {
  //Omitted username/studentID/email check since declared as unique in user schema
  const { username, firstName, lastName, email, password, userType, studentID, verified } = req.body;
  const user = new User({ username, firstName, lastName, email, password, userType, studentID, verified});
  await user.save();
  res.status(201).json({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      userType: user.userType,
      studentID: user.studentID,
      verified: user.verified,
      token: generateToken(user._id)
  });
});


// @Desc Login user
// @Route /api/users/login
// @Method POST
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if(!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if(await user.comparePassword(password)) {
    res.status(200).json({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType,
      verified: user.verified,
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error("Email or password incorrect");
  }
})


// @Desc Delete user by ID
// @Route /api/users/:id
// @Method DELETE
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, firstName, lastName, password } = req.body;

    let filter = 
    {
        email: email,
        firstName: firstName,
        lastName: lastName
    };

  let user = await User.findOne(filter);
  if(!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await User.findOneAndDelete(filter);
  res.status(201).json({});
});


// @Desc Verify
// @Route /api/users/verify
// @Method POST
export const verifyUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, firstName, lastName, username } = req.body;

    let filter = 
    {
        email: email,
        firstName: firstName,
        lastName: lastName,
        username: username
    };

    console.log(req.body, "validated");
  let user = await User.findOne(filter);
  if(!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await User.findOneAndUpdate(filter, {verified: true});
  res.status(201).json({});
});


