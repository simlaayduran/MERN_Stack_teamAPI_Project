import { Term } from "../enums/Term";

export interface ITAwishlist{
    username_prof: string,
    username_ta: string, 
    courseNumber: string, 
    term: Term, 
    year: string, 
    info: string,
    timestamp: Date
}