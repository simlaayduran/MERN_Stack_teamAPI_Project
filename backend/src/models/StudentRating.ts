import mongoose, { mongo } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Term } from './Course';


const Schema = mongoose.Schema;


export interface IStudentRating extends mongoose.Document {
    _id: ObjectId,
    username_stud: string,
    username_ta: string, 
    courseNumber: string, 
    term: Term, 
    year: string, 
    rating: Number, 
    comment: string, 
    timestamp: Date
}


const StudentRatingSchema = new mongoose.Schema({

    username_stud: {
        type: String,
        required: true,
    },

    username_ta: {
        type: String,
        required: true,
    },

    courseNumber: {
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

    rating: {
        type: Number,
        required: true,
    },

    comment: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
})

const StudentRating = mongoose.model<IStudentRating>("StudentRating", StudentRatingSchema);
export default StudentRating;