import React, { useEffect } from "react";
import "../../style/userTable.css";
import { StudentRating } from "../../classes/StudentRating";
import StudentRatingRow from "./StudentRatingRow";
import { Container } from "react-bootstrap";
import AddStudentRatingForm from "./AddStudentRatingForm";

const ManageStudentRating = ({usernameString}) => {
  const [studentRatings, setStudentRatings] = React.useState<Array<StudentRating>>([]);

  const fetchStudentRatingData = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/studentRating?" + new URLSearchParams({
        username_stud: usernameString as string,
    }));

      const json = await res.json();
      setStudentRatings(json.studentRatings);
    } catch (err) {
      console.log(err);
    }
  }; 

  useEffect(() => {
    // Load data
    fetchStudentRatingData();
  }, []);

  return (
    <div>
      <Container className="mt-3">
        <div className="rowC">
          <h2 style={{ marginBottom: "20px" }}>Rate a TA</h2> 
          <AddStudentRatingForm fetchStudentRatingData={fetchStudentRatingData} />
        </div>
        <div id="profTable">
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
        </div>
      </Container>
    </div>
  );
};

export default ManageStudentRating;