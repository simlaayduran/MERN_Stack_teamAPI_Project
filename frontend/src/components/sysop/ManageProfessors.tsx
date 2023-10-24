import React, { useEffect } from "react";
import AddProfForm from "./AddProfForm";
import ProfRow from "./ProfRow";
import "../../style/userTable.css";
import { DisplayProfessor } from "../../classes/DisplayProfessor";
import ImportForm from "./ImportForm";
import { Container } from "react-bootstrap";

const ManageProfessors = () => {
  const [profs, setProfs] = React.useState<Array<DisplayProfessor>>([]);

  const fetchProfData = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/course/profs");
      const json = await res.json();
      setProfs(json.output);
    } catch (err) {
      console.log(err);
    }
  }; 

  useEffect(() => {
    // Load data
    fetchProfData();
  }, []);

  return (
    <div>
      
      <Container className="mt-3">
        <div className="rowC">
          <h2 style={{ marginBottom: "20px" }}>All Professors</h2> 
        </div>
        <div id="profTable">
          <table>
            <thead>
              <tr>
                <th className="column0"></th>
                <th className="column1">Email</th>
                <th className="column2">First Name</th>
                <th className="column3">Last Name</th>
                <th className="column4">Courses</th>
              </tr>
            </thead>
            <tbody>
              {/**Set to hardcoded list of profs for testing purposes */}
              {profs.map((professor: DisplayProfessor, i: number) => {
                if (professor) {
                  return <ProfRow key={i} professor={professor} fetchProfData={fetchProfData} />;
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

export default ManageProfessors;
