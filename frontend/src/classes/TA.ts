import { Course } from './Course';

export interface TA {
  term: string, 
  year: Number,
  legalName: String,
  supervisorName: String,
  isGrad: Boolean,
  priorityForCourses: Boolean,
  dateApplied: Date,
  location: String,
  phone: String,
  degree: String,
  coursesAssignedTo: Array<Course>,
  coursesAppliedTo: Array<Course>,
  openToOtherCourses: Boolean,
  notes: Array<String>,
  hours: Number
}