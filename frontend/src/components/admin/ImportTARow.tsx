import React from "react";
import RemoveIcon from "@material-ui/icons/Remove";
import { FlaggedCourse } from "../../classes/FlaggedCourse";

const resolveBackgroundColor = (value: string) => {
  let color = 'black';
  let fontWeight = 'normal';

  if (parseFloat(value) < 30 || parseFloat(value) > 45)
  {
    color = 'rgba(255, 41, 41, 1.0)';
    fontWeight = 'bold';
  }
  if (parseFloat(value) > 30 && parseFloat(value) < 45)
  {
    color = 'rgba(57, 178, 79, 1.0)';
    fontWeight = 'bold';
  }

  return {"color": color, "fontWeight": fontWeight};
}

// A small row for displaying a flagged course - used to show courses that have an imbalanced TA-to-student quota
const ImportTARow = ({ course, fetchFlaggedCourseData }: { course: FlaggedCourse; fetchFlaggedCourseData: Function }) => {
  return (
    <tr className="body">
      <td className="column0" >{course.courseNumber}</td>
      <td className="column1">{course.courseName}</td>
      <td className="column2">{course.courseInstructor}</td>
      <td className="column3">{course.courseType}</td>
      <td className="column4" style={resolveBackgroundColor(course.taToStudentQuota)}>{course.taToStudentQuota}</td>
      <td className="column5" style={resolveBackgroundColor(course.taToStudentQuotaCurrent)}>{course.taToStudentQuotaCurrent}</td>
    </tr>
  );
};

export default ImportTARow;


