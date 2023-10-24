import React from "react";
import RemoveIcon from "@material-ui/icons/Remove";
import { Course } from "../../classes/Course";

const CourseRow = ({ course, fetchCourseData }: { course: Course; fetchCourseData: Function }) => {
  const handleDeleteCourse = async () => {
    try {
      let req = await fetch("http://127.0.0.1:5000/api/course/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: course.term,
          year: course.year,
          courseNumber: course.courseNumber,
        })
      });

      if (req.status === 401) {
        alert("Error while deleting course.");
      }
    } catch (err) {
      console.log(err);
    }

    fetchCourseData();
  };

  return (
    <tr className="body">
      <td className="column0">
        <button className="btn btn-secondary" onClick={handleDeleteCourse}>
          <RemoveIcon />
        </button>
      </td>
      <td className="column1">{course.courseNumber}</td>
      <td className="column2">{course.courseName}</td>
      <td className="column3">{course.courseDesc}</td>
      <td className="column4">{course.term}</td>
      <td className="column5">{course.year}</td>
      <td className="column6">{course.instructorName}</td>
    </tr>
  );
};

export default CourseRow;
