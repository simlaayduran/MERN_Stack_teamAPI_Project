import mongoose, { mongo } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Term } from './Course';


const Schema = mongoose.Schema;


export interface ITAwishlist extends mongoose.Document {
    username_prof: string,
    username_ta: string, 
    courseNumber: string, 
    term: Term, 
    year: string, 
    info: string, 
    timestamp: Date
}

const TAwishlistSchema = new mongoose.Schema({

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
    info: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
})

const TAwishlist = mongoose.model<ITAwishlist>("TAwishlist", TAwishlistSchema);
export default TAwishlist;