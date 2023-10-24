import "../../style/userTable.css";
import { Course } from "../../classes/Course";

// A small generic row for displaying a course - used for displaying which courses a TA has been assigned to
const GenericCourseRow = ({ course, fetchCourseData }: { course: Course; fetchCourseData: Function }) => {
  return (
    <tr className="body">
      <td className="column0">{course.courseNumber}</td>
      <td className="column1">{course.courseName}</td>
      <td className="column1">{course.instructorName}</td>
    </tr>
  );
};

export default GenericCourseRow;
