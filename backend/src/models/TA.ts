import mongoose from 'mongoose';
import {IUser} from "./User";
import {ICourse, Term} from "./Course";
const Schema = mongoose.Schema;

export interface ITA extends mongoose.Document {
    username: string,
    term: Term, // think about what happens when profs are cross appointed 
    year: Number,
    supervisorName: String,
    isGrad: Boolean,
    priorityForCourses: Boolean,
    dateApplied: Date,
    location: String,
    phone: String,
    degree: String,
    coursesAssignedTo: Array<ICourse>,
    coursesAppliedTo: Array<ICourse>,
    openToOtherCourses: Boolean,
    notes: Array<String>,
    hours: Number
}

const TASchema = new mongoose.Schema({
    username: {
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
    supervisorName: {
        type: String,
        required: true
    },
    isGrad: {
        type: Boolean,
        required: true,
    },
    priorityForCourses:
    {
        type: Boolean,
        required: true,
    },
    dateApplied: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    coursesAssignedTo: [{
        type: Schema.Types.ObjectId,
        ref: "Course"
    }],
    coursesAppliedTo: [{
        type: Schema.Types.ObjectId,
        ref: "Course"
    }],
    openToOtherCourses: {
        type: Boolean,
        required: true
    },
    notes: [{
        type: String,
        required: true
    }],
    hours: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const TA = mongoose.model<ITA>("TA", TASchema);

export default TA;