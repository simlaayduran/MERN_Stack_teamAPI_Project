import cors from 'cors';
import express, { Request, Response } from 'express';
import connectDB from "./config/db.config";
import userRoutes from './routes/userRoutes';
import profRoutes from './routes/profRoutes';
import courseRoutes from './routes/courseRoutes';
import taRoutes from "./routes/taRoutes";
import studentRatingRoutes from "./routes/studentRatingRoutes";
import professorRatingRoutes from "./routes/professorRatingRoutes";

const app = express();
const port = 5000;

// Basic express setup
app.use(cors());
app.use(express.json());
connectDB();

app.use("/api/users", userRoutes);
app.use("/api/prof", profRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/ta", taRoutes);
app.use("/api/studentRating", studentRatingRoutes);
app.use("/api/professorRating", professorRatingRoutes);


app.listen(port, () => {
    console.log('Backend is running on port: ' + port)
})

