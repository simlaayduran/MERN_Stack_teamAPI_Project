import React, { useEffect } from "react";
import "../../style/userTable.css";
import { ProfessorRating } from "../../classes/ProfessorRating";
import ProfessorRatingRow from "./ProfessorRatingRow";
import { Container } from "react-bootstrap";
import AddProfessorRatingForm from "./AddProfessorRatingForm";

const ManageProfessorRating = ({usernameString}) => {
  const [professorRatings, setProfessorRatings] = React.useState<Array<ProfessorRating>>([]);

  const fetchProfessorRatingData = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/professorRating?" + new URLSearchParams({
        username_prof: usernameString as string,
    }));
      const json = await res.json();
      setProfessorRatings(json.professorRatings);
    } catch (err) {
      console.log(err);
    }
  }; 

  useEffect(() => {
    // Load data
    fetchProfessorRatingData();
  }, []);

  return (
    <div>
      <Container className="mt-3">
        <div className="rowC">
          <h2 style={{ marginBottom: "20px" }}>Rate a TA</h2> 
          <AddProfessorRatingForm fetchProfessorRatingData={fetchProfessorRatingData} />
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
              {professorRatings?.map((professorRating: ProfessorRating, i: number) => {
                if (professorRating) {
                  return <ProfessorRatingRow key={i} professorRating={professorRating} />
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

export default ManageProfessorRating;