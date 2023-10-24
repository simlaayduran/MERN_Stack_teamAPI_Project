import { Term } from "../enums/Term";

export interface ProfessorRating{
    username_prof: string;
    username_ta: string;
    courseNumber: string;
    term: Term;
    year: string;
    rating: Number;
    comment: string;
}