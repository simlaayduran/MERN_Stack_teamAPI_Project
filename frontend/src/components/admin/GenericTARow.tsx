import "../../style/userTable.css";
import { Course } from "../../classes/Course";

// A small generic row for displaying a course - used to show the courses and what TAs are currently assigned
const GenericTARow = ({ course, fetchCourseData }: { course: Course; fetchCourseData: Function }) => {
  return (
    <tr>
      <td className="column0">{course.term}</td>
      <td className="column1">{course.year}</td>
      <td className="column2">{course.courseNumber}</td>
      <td className="column2">{course.courseName}</td>
      <td className="column2">{course.instructorName}</td>
      <td className="column3">{course.tasAssignedTo}</td>
    </tr>
  );
};

export default GenericTARow;
