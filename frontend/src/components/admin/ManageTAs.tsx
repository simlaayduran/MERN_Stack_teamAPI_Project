import React, { useEffect } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";

import "../../style/userTable.css";
import ImportTARow from "./ImportTARow";
import ImportForm from "../sysop/ImportForm";

import { FlaggedCourse } from "../../classes/FlaggedCourse";
import { Term } from "../../enums/Term";

// The main Import TA tab
const ManageTAs = () => {
  const [displayCourses, setdisplayCourses] = React.useState<Array<FlaggedCourse>>([]);
  const [tempTerm, setTempTerm] = React.useState<Term>();
  const [tempYear, setTempYear] = React.useState<number>();
  const fetchFlaggedCourseData = async () => {
    try {
      let req = await fetch("http://127.0.0.1:5000/api/ta/impDisplayInfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: tempTerm,
          year: tempYear
        })
      });

      const data = await req.json();
      const courseObject = [];
      for (const d of data.out) {
        
        let item = {
          courseName: d.courseName,
          courseNumber: d.courseNumber,
          courseInstructor: d.courseInstructor,
          courseType: d.courseType,
          taToStudentQuota: d.taToStudentQuota,
          taToStudentQuotaCurrent: d.taToStudentQuotaCurrent
        }
        courseObject.push(item);
      }
      setdisplayCourses(courseObject);
    } catch (err) {
      console.log(err);
    }
  }; 

  useEffect(() => {
    // Load data
    fetchFlaggedCourseData();
  }, [tempTerm, tempYear]);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Import TA Cohort <ImportForm taskName="TA Cohort" uploadUrl="http://127.0.0.1:5000/api/ta/upload"/></th>
            <th>Import Course Quota <ImportForm taskName="Course Quota" uploadUrl="http://127.0.0.1:5000/api/course/uploadInfo"/></th>
          </tr>
        </thead>
      </table>
      <Container className="mt-3">
        <div className="rowC">
          <h2 style={{ marginBottom: "20px" }}>Flagged Courses</h2> 
        </div>
        <div style={{ marginBottom: "20px" }}>
        <Row>
              <Col>
              <h6 >Select Term</h6> 
              <Form.Select required onChange={(e) => setTempTerm(e.target.value as Term)}>
                <option value={Term.Fall} >Fall</option>
                <option value={Term.Winter}>Winter</option>
                <option value={Term.Summer}>Summer</option>
              </Form.Select>
              </Col>
              <Col>
              <h6 >Select Year</h6> 
              <Form.Select required onChange={(e) => setTempYear(parseInt(e.target.value))}>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
              </Form.Select>
              </Col>
            </Row> </div>
        <div id="profTable">
          <table>
            <thead>
              <tr>
                <th className="column0">Course Number</th>
                <th className="column1">Course Name</th>
                <th className="column2">Course Instructor</th>
                <th className="column3">Course Type</th>
                <th className="column4">TA-to-Student Quota (Imported)</th>
                <th className="column5">TA-to-Student Quota (Current)</th>
              </tr>
            </thead>
            <tbody>
              {displayCourses.map((course: FlaggedCourse, i: number) => (
                <ImportTARow key={i} course={course} fetchFlaggedCourseData={fetchFlaggedCourseData} />
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </div>
  );
};

export default ManageTAs;
