import React, { useEffect, useState } from "react";
import { Form, Col, Container, Row } from "react-bootstrap";

import { Preview } from "@mui/icons-material";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import "../../style/userTable.css";
import ProfessorRatingRow from "./../sysop/ProfessorRatingRow";
import StudentRatingRow from "./../sysop/StudentRatingRow";
import GenericCourseRow from "./GenericCourseRow";
import GenericTARow from "./GenericTARow";

import { Course } from "../../classes/Course";
import { ProfessorRating } from "../../classes/ProfessorRating";
import { StudentRating } from "../../classes/StudentRating";
import { User } from "../../classes/User";
import { TA } from "../../classes/TA";
import { Term } from "../../enums/Term";

// The main TA History tab - two views, Select by TA and Select by Course
// Yes, it's pretty convoluted
const ManageHistory = () => {
  const [courses, setCourses] = useState<Array<Course>>([]);

  // This keeps a set of all course numbers to select from - the Select By Course view shows all term_years for a course
  const [uniqueCourseOptions, setUniqueCourseOptions] = useState<Array<Course>>([]);
  const [courseOccurences, setCourseOccurences] = useState<Array<Course>>([]);

  // Store what courses the selected TA is assigned to and/or wishlisted for
  const [wishlistCourses, setWishlistCourses] = useState<Array<Course>>([]);
  const [assignedCourses, setAssignedCourses] = useState<Array<Course>>([]);

  // The selected term and year for Select by TA view
  const [tempTerm, setTempTerm] = React.useState<Term>();
  const [tempYear, setTempYear] = React.useState<number>();

  // Relevant information to track for Select by TA view
  const [users, setUsers] = React.useState<Array<User>>([]);
  const [selectedTA, setSelectedTA] = React.useState<User>();
  const [selectedTAHistory, setSelectedTAHistory] = React.useState<TA>();

  // Relevant information to track for Select by Course view
  const [selectedCourse, setSelectedCourse] = React.useState<Course>();

  // Swap views
  const [show, setShow] = React.useState(false);

  // Relevant information for the student and professor ratings
  const [professorRatings, setProfessorRatings] = React.useState<Array<ProfessorRating>>([]);
  const [studentRatings, setStudentRatings] = React.useState<Array<StudentRating>>([]);
  const [average, setAverage] = React.useState<Number>(0);

  // Fetch all the required data
  const fetchStudentRatingData = async () => {
    if (selectedTA) {
      if (tempTerm && tempYear) {
        try {
          const res = await fetch("http://127.0.0.1:5000/api/studentRating/for?" + new URLSearchParams({
            username_ta: selectedTA.username as string,
            term: tempTerm as string,
            year: tempYear as unknown as string,
          }));

          const json = await res.json();
          setStudentRatings(json.studentRatings);

          if (json.studentRatings.length > 0)
          {
            let sum = 0;
            for(const studentRating of json.studentRatings) {
              sum = sum + (studentRating.rating as number);
            }
            let calculatedAverage = sum / json.studentRatings.length;
            console.log(calculatedAverage);
            setAverage(calculatedAverage);
          }
          else
          {
            setAverage(0.0);
          }
          

        } catch (err) {
          console.log(err);
        }
      }
    }
  }; 

  const fetchProfessorRatingData = async () => {
    if (selectedTA) {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/professorRating/for?" + new URLSearchParams({
          username_ta: selectedTA.username as string,
          term: tempTerm as string,
          year: tempYear as unknown as string
        }));
        const json = await res.json();
        setProfessorRatings(json.professorRatings);
      } catch (err) {
        console.log(err);
      }
    }
  }; 

  // When in Select by TA view, we use this to obtain extra course data for the selected TA
  const fetchCourseDataTA = async () => {
    if (selectedTA) {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/course");
        const data = await res.json();

        let assignedCourseRes = await fetch("http://127.0.0.1:5000/api/ta/courseForTA", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            term: tempTerm,
            year: tempYear,
            username: selectedTA.username
          })
        });
      const assignedCourseData = await assignedCourseRes.json();

     
      //const wishlistCoursesData = await wishlistedCourseRes.json();
      
      const courseObject = [];
      //const wishlistCoursesObject = [];
      const assignedCoursesObject = [];

      for (const d of data.courses) {
        const instructorRes = await fetch("http://127.0.0.1:5000/api/users/" + d.courseInstructor);
        let item = {
          _id: d._id,
          courseNumber: d.courseNumber,
          courseName: d.courseName,
        }
        if (instructorRes) {
          const instructorData = await instructorRes.json();
          item["instructorName"] = instructorData.user.firstName + " " + instructorData.user.lastName;
        } else {
          item["instructorName"] = ""
        }

        for (const a of assignedCourseData.courses) {
          if (a.courseNumber == d.courseNumber && d.term == a.term && d.year == a.year) {
            assignedCoursesObject.push(item);
          }
        }
        courseObject.push(item);
        }
        setCourses(courseObject);
        //setWishlistCourses(wishlistCoursesObject);
        setAssignedCourses(assignedCoursesObject);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // When in Select by Course view, we use this to obtain/transform extra data for the selected course
  const fetchCourseData = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/course");
      const data = await res.json();

      const courseObject = [];
      const courseOccurenceObject = [];
      const uniqueCourseOptionsObject = [];
      const uniqueCourseOptionsSetObject = new Set();
      for (const d of data.courses) {
        const instructorRes = await fetch("http://127.0.0.1:5000/api/users/" + d.courseInstructor);

        // Display as names, not ids
        let tasParsed = [];
        for(const t of d.tasAssignedTo) {
          const taRes = await fetch("http://127.0.0.1:5000/api/users/" + t);
          if (taRes) {
            const taData = await taRes.json();
            tasParsed.push(taData.user.firstName + " " + taData.user.lastName);
          } 
        }

        let item = {
          _id: d._id,
          term: d.term,
          year: d.year,
          courseNumber: d.courseNumber,
          courseName: d.courseName,
          tasAssignedTo: tasParsed
        }
        if (instructorRes) {
          const instructorData = await instructorRes.json();
          item["instructorName"] = instructorData.user.firstName + " " + instructorData.user.lastName;
        } else {
          item["instructorName"] = ""
        }

        if (selectedCourse) {
          if (d.courseNumber == selectedCourse.courseNumber) {
            courseOccurenceObject.push(item);
          }
        }

        // Keep the autocomplete options unique
        if (!uniqueCourseOptionsSetObject.has(d.courseNumber)) {
          uniqueCourseOptionsSetObject.add(d.courseNumber);
          uniqueCourseOptionsObject.push(item);
        }

        courseObject.push(item);
      }
      setCourses(courseObject);
      setCourseOccurences(courseOccurenceObject);
      setUniqueCourseOptions(uniqueCourseOptionsObject);
    } catch (err) {
      console.error(err);
    }
  
  };

  const fetchUserData = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/ta/");
      const data = await res.json();
      const userObject = data.users;
      setUsers(userObject);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSelectedTAHistory = async () => {
    if (selectedTA) {
    try {
      let res = await fetch("http://127.0.0.1:5000/api/ta/:e", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: tempTerm,
          year: tempYear,
          username: selectedTA.username
        })
      });
      const data = await res.json();
      const selectedTAHistoryObject = data.history[0];
      setSelectedTAHistory(selectedTAHistoryObject);

    } catch (err) {
      console.error(err);
    }
  }
  }; 

  const fetchTAWishlistData = async () => {
    if (selectedTA) {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/ta/wishlistedSimple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            term: tempTerm,
            year: tempYear,
            username_ta: selectedTA.username
        }),
      });

      const data = await res.json();
      const courseObject = [];
      for (const d of data.wishesPretty) {
        let item = {
          instructorName: d.username_prof,
          courseNumber: d.courseNumber,
          courseName: d.courseName,
        }

        courseObject.push(item);
      }
      setWishlistCourses(courseObject);
    } catch (err) {
      console.error(err);
    }
  }
  };

  useEffect(() => {
    if (show) {
      fetchCourseDataTA();
      
    }
    else {
      fetchCourseData();
    }
    fetchSelectedTAHistory();
    fetchUserData();
    fetchProfessorRatingData();
    fetchTAWishlistData();
    fetchStudentRatingData();
    
  }, [selectedTA, selectedCourse]);

  // Parse course ids as course numbers
  const renameCourses = (coursesAppliedTo) => {
    let parsed = [];
    if (selectedTAHistory)
    {
      for (const a of courses) {
        //console.log(a._id);
        for (const b of selectedTAHistory.coursesAppliedTo) {
          //console.log("b", b);
          //console.log("s", b.toString());
          if (a._id == b.toString()) {
            parsed.push(a.courseNumber);
          }
        }
      } 
    }
    return parsed;
  };

  const resetTA = () => {
    setShow(true); 
    setSelectedCourse(null); 
  };

  const resetCourse = () => {
    setShow(false); 
    setSelectedTA(null); 
    setSelectedTAHistory(null);
  };

  const resetTerm = (e) => {
    setTempTerm(e);
     
    setSelectedTA(null); 
    setSelectedTAHistory(null);
  };

  const resetYear = (e) => {
    setTempYear(e);
     
    setSelectedTA(null); 
    setSelectedTAHistory(null);
  };

  return (
      <div>
        <table>
          <thead>
            <tr>
              <th>Select View <div><button className="courses" onClick={() => resetCourse()}>
                <Preview /> By Course
              </button></div></th>
              <th>&nbsp;<div><button className="courses" onClick={() => resetTA()}>
                <Preview /> By TA
              </button></div></th>
            </tr>
          </thead>
        </table>
        <Container className="mt-3">
          {show && <div className="rowC"><h2 style={{ marginBottom: "20px" }}>TA History</h2></div>}
          {show && <Row>
              <Col>
              <h6 >Select Term</h6> 
              <Form.Select required onChange={(e) => resetTerm(e.target.value as Term)}>
                <option value={Term.Fall} >Fall</option>
                <option value={Term.Winter}>Winter</option>
                <option value={Term.Summer}>Summer</option>
              </Form.Select>
              </Col>
              <Col>
              <h6 >Select Year</h6> 
              <Form.Select required onChange={(e) => resetYear(parseInt(e.target.value))}>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
              </Form.Select>
              </Col>
            </Row>}
          {show && <div>
            <Autocomplete
            onInputChange={(event, newInputValue) => {
              for (const u of users) {
                if ((u.firstName + " " + u.lastName) === newInputValue) {
                  setSelectedTA(u);
                  return;
                }
              }
            }}
            
            id="clear-on-escape"
            options={users}
            getOptionLabel={(option: User) => (option.firstName + " " + option.lastName)}
            isOptionEqualToValue={(option, value) => (option.firstName + " " + option.lastName) === (value.firstName + " " + value.lastName)}
            clearOnEscape
            renderInput={(params) => (
              <TextField {...params} label="Please enter the TA's name." variant="standard" />
            )} /></div>}
          {show && selectedTA && selectedTAHistory && <div className="rowC"><h2 style={{ marginBottom: "20px" }}>TA Information</h2></div>}
          {show && selectedTA && selectedTAHistory && <div id="profTable" style={{ marginBottom: "20px" }}>
              <table>
                <thead>
                  <tr>
                    <th className="column0">Name:</th>
                    <td className="columnsp">{selectedTA.firstName + " " + selectedTA.lastName}</td>
                    <th className="column0">&nbsp;</th>
                    <th className="column0">&nbsp;</th>
                    <th className="column0">Priority:</th>
                    <td className="columnsp">{selectedTAHistory.priorityForCourses == true ? "YES" : "NO"}</td>
                  </tr>
                  <tr>
                    <th className="column0">Legal Name:</th>
                    <td className="columnsp">{selectedTA.firstName + " " + selectedTA.lastName}</td>
                    <th className="column0">&nbsp;</th>
                    <th className="column0">&nbsp;</th>
                    <th className="column0">Hours:</th>
                    <td className="columnsp">{selectedTAHistory.hours}</td>
                  </tr>
                  <tr>
                    <th className="column0">Student ID:</th>
                    <td className="columnsp">{selectedTA.studentID}</td>
                    <th className="column0">&nbsp;</th>
                    <th className="column0">&nbsp;</th>
                    <th className="column0">Date Applied:</th>
                    <td className="columnsp">{new Date(selectedTAHistory.dateApplied).toDateString()}</td>
                  </tr>
                  <tr>
                    <th className="column0">Email:</th>
                    <td className="columnsp">{selectedTA.email}</td>
                    <th className="column0">&nbsp;</th>
                    <th className="column0">&nbsp;</th>
                    <th className="column0">Location:</th>
                    <td className="columnsp">{selectedTAHistory.location}</td>
                  </tr>
                  <tr>
                    <th className="column0">Level:</th>
                    <td className="columnsp">{selectedTAHistory.isGrad == true ? "Graduate" : "Undergraduate"}</td>
                    <th className="column0">&nbsp;</th>
                    <th className="column0">&nbsp;</th>
                    <th className="column0">Phone:</th>
                    <td className="columnsp">{selectedTAHistory.phone}</td>
                  </tr>
                  <tr>
                    <th className="column0">Supervisor:</th>
                    <td className="columnsp">{selectedTAHistory.supervisorName}</td>
                    <th className="column0">&nbsp;</th>
                    <th className="column0">&nbsp;</th>
                    <th className="column0">Degree:</th>
                    <td className="columnsp">{selectedTAHistory.degree}</td>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>}
            {show && selectedTA && selectedTAHistory && <div id="profTable" style={{ marginBottom: "20px" }}>
              <table>
                <thead>
                  <tr><th className="column0">Courses Applied To:</th>
                    <td className="columnsp">{renameCourses(selectedTAHistory.coursesAppliedTo)}</td>
                  </tr>
                  <tr><th className="column0">Open To Other Courses:</th>
                    <td className="columnsp">{selectedTAHistory.openToOtherCourses ? "YES" : "NO"}</td>
                  </tr>
                  <tr><th className="column0">Notes:</th>
                    <td className="columnsp">{selectedTAHistory.notes}</td>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
              </div>}
            {show && selectedTA && selectedTAHistory && <div className="rowC"><h2 style={{ marginBottom: "20px" }}>Course Assignments</h2></div>}
            {show && selectedTA && selectedTAHistory && <div id="profTable" style={{ marginBottom: "20px" }}>
            <table>
                <thead>
                  <tr>
                    <th className="column0">Course Number</th>
                    <th className="column1">Course Name	</th>
                    <th className="column2">Professor</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedCourses?.map((course: Course, i: number) => {
                    if (course) {
                      return <GenericCourseRow key={i} course={course} fetchCourseData={fetchCourseData}/>
                    }
                    return null;
                  })}
                </tbody>
              </table>
            </div>}
            {show && selectedTA && selectedTAHistory && <div className="rowC"><h2 style={{ marginBottom: "20px" }}>Wishlisted By</h2></div>}
            {show && selectedTA && selectedTAHistory && <div id="profTable" style={{ marginBottom: "20px" }}>
            <table>
            <thead>
                  <tr>
                    <th className="column0">Course Number</th>
                    <th className="column1">Course Name	</th>
                    <th className="column2">Professor</th>
                  </tr>
                </thead>
            <tbody>
              {wishlistCourses?.map((course: Course, i: number) => {
                if (course) {
                  return <GenericCourseRow key={i} course={course} fetchCourseData={fetchTAWishlistData}/>
                }
                return null;
              })}
            </tbody>
          </table>
            </div>}
            {show && selectedTA && selectedTAHistory && <div className="rowC"><h2 style={{ marginBottom: "20px" }}>Student Ratings</h2></div>}
            {show && selectedTA && selectedTAHistory &&<div style={{ marginBottom: "20px" }}>Average: {average}</div>}
            {show && selectedTA && selectedTAHistory &&<div id="profTable" style={{ marginBottom: "20px" }}>
              <table>
                <thead>
                  <tr>
                    <th className="column0"></th>
                    <th className="column1">username [student]</th>
                    <th className="column2">username [TA]</th>
                    <th className="column3">course</th>
                    <th className="column4">term</th>
                    <th className="column5">year</th>
                    <th className="column6">rating</th>
                    <th className="column7">comment</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRatings?.map((studentRating: StudentRating, i: number) => {
                  if (studentRating) {
                    return <StudentRatingRow key={i} studentRating={studentRating} />
                  }
                  return null;
                  })}
                </tbody>
              </table>
            </div>}
            {show && selectedTA && selectedTAHistory &&<div className="rowC"><h2 style={{ marginBottom: "20px" }}>Professor Ratings</h2></div>}
            {show && selectedTA && selectedTAHistory &&<div id="profTable" style={{ marginBottom: "20px" }}>
              <table>
                <thead>      
                  <tr>
                    <th className="column0"></th>
                    <th className="column1">username [prof]</th>
                    <th className="column2">username [TA]</th>
                    <th className="column3">course</th>
                    <th className="column5">term</th>
                    <th className="column6">year</th>
                    <th className="column7">comment</th>
                  </tr>
                </thead>
                <tbody>
                  {professorRatings?.map((professorRating: ProfessorRating, i: number) => {
                    if (professorRating) {
                      return <ProfessorRatingRow key={i} professorRating={professorRating} />
                    }
                    return null;
                  })}
                </tbody>
              </table>
            </div>}
          {show==false && <div className="rowC"><h2 style={{ marginBottom: "20px" }}>TA History</h2></div>}
          {show==false && <div>
            <Autocomplete
            onInputChange={(event, newInputValue) => {
              for (const u of courses) {
                if ((u.courseNumber) === newInputValue) {
                  setSelectedCourse(u);
                  return;
                }
              }
            }}
            
            id="clear-on-escape"
            options={uniqueCourseOptions}
            getOptionLabel={(option: Course) => (option.courseNumber)}
            isOptionEqualToValue={(option, value) => (option.courseNumber) === (value.courseNumber)}
            clearOnEscape
            renderInput={(params) => (
              <TextField {...params} label="Please enter the course number." variant="standard" />
            )} /></div>}
          {show==false && selectedCourse && <div id="profTable">
            <table>
              <thead>
                <tr>
                  <th className="column0">Term </th>
                  <th className="column1">Year</th>
                  <th className="column2">Course Number	</th>
                  <th className="column3">Course Name	</th>
                  <th className="column4">Professor</th>
                  <th className="column5">TAs</th>
                </tr>
              </thead>
              <tbody>
                  {courseOccurences.map((course: Course, i: number) => (
                  <GenericTARow key={i} course={course} fetchCourseData={fetchCourseData} />
                ))}
              </tbody>
            </table>
          </div>}
      </Container>
    </div>
  );
};

export default ManageHistory;