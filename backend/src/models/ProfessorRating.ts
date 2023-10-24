import mongoose, { mongo } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Term } from './Course';


const Schema = mongoose.Schema;


export interface IProfessorRating extends mongoose.Document {
    _id: ObjectId,
    username_prof: string,
    username_ta: string, 
    courseNumber: string, 
    term: Term, 
    year: string, 
    comment: string, 
    timestamp: Date
}


const ProfessorRatingSchema = new mongoose.Schema({

    username_prof: {
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

    comment: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
})

const ProfessorRating = mongoose.model<IProfessorRating>("ProfessorRating", ProfessorRatingSchema);
export default ProfessorRating;