import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";

import "../../style/userTable.css";
import AssignTAForm from "./AssignTAForm";
import RemoveTAForm from "./RemoveTAForm";
import { Course } from "../../classes/Course";

// The main Add/Remove TA from Course tab
const ManageAssignments = () => {
  const [courses, setCourses] = useState<Array<Course>>([]);

  const fetchCourseData = async () => {
    try {
      const res = await fetch("http://127.0.0.1:3000/api/course");
      const data = await res.json();
      const courseObject = [];
      for (const d of data.courses) {
        const instructorRes = await fetch("http://127.0.0.1:3000/api/users/" + d.courseInstructor);
        let item = {
          courseNumber: d.courseNumber,
          courseName: d.courseName,
          courseDesc: d.courseDesc,
          term: d.term,
          year: d.year,
        }
        if (instructorRes) {
          const instructorData = await instructorRes.json();
          item["instructorName"] = instructorData.user.firstName + " " + instructorData.user.lastName;
        } else {
          item["instructorName"] = ""
        }
        courseObject.push(item);
      }
      setCourses(courseObject);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, []);

  return (
    <div>
      <Container className="mt-3">
        <div className="rowC">
          <AssignTAForm fetchCourseData={fetchCourseData} />
          <div style={{ margin: "20px"}}></div>
          <RemoveTAForm fetchCourseData={fetchCourseData} />
        </div>
      </Container>
    </div>
  );
};

export default ManageAssignments;
