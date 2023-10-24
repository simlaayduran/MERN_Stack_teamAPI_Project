import { Term } from "../enums/Term";

export interface StudentRating{
    username_stud: string;
    username_ta: string;
    courseNumber: string;
    term: Term;
    year: string;
    rating: Number;
    comment: string;

}