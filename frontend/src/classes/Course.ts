import { User } from './User';
export interface Course {
  _id: string,
  term: string;
  year: string;
  courseNumber: string;
  courseName: string;
  courseDesc: string;
  instructorName: string;
  tasAssignedTo: Array<User>;
}
