// require('dotenv').config()
// this needs to be managed using a .env file
// Put the Mongo connection string in the file as MONGO_CONNECTION_STRING="xxxx"
// const url = process.env.MONGO_CONNECTION_STRING;


import mongoose from 'mongoose';
import { ConnectionOptions } from 'tls';

const connectDB = async () => {
    try {
        const connect = await mongoose.connect("mongodb://localhost:27017/comp307" as string, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            family: 4,
        } as ConnectionOptions);
        console.log("Database is connected!");
    } catch (error: any) {
        console.log(error.message);
    }
}

export default connectDB;