import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import {IProfessor} from "./Professor";
import { IUser } from './User';

const Schema = mongoose.Schema;

export enum Term {
    Fall = "fall",
    Winter = "winter",
    Summer = "summer"
}

enum Type {
    Regular = "regular",
    Seminar = "seminar",
    Lab = "lab",
    Other = "other"
}

export interface ICourse extends mongoose.Document {
    _id: ObjectId,
    courseName: string,
    courseDesc: string,
    term: Term,
    year: string,
    courseNumber: string,
    courseInstructor: IUser,
    courseType: Type,
    courseEnrollmentNumber: Number,
    taQuota: Number,
    taToStudentQuota: Number,
    tasAssignedTo: Array<IUser>,
    studentsAssignedTo: Array<IUser>
}

const CourseSchema = new mongoose.Schema({

    courseName: {
        type: String,
        required: true,
    },

    courseDesc: {
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

    courseNumber: {
        type: String,
        required: true,
    },

    courseInstructor: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    courseType: {
        type: String,
        required: false,
    },
    courseEnrollmentNumber: {
        type: Number,
        required: false,
    },
    taQuota: {
        type: Number,
        required: false,
    },
    taToStudentQuota: {
        type: Number,
        required: false,
    },
    tasAssignedTo: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    studentsAssignedTo: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }]
}, {
    timestamps: true
})

const Course = mongoose.model<ICourse>("Course", CourseSchema);

export default Course;