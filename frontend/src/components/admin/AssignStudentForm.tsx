import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import "../../style/userTable.css";
import { Term } from "../../enums/Term";

// Form to define and assign a Student to a Course
const AssignStudentForm = ({ fetchCourseData }) => {
  const [show, setShow] = React.useState(false);
  const [tempCourseNumber, setCourseNumber] = React.useState("");
  const [tempTerm, setTempTerm] = React.useState<Term>();
  const [tempYear, setTempYear] = React.useState<number>(0);
  const [tempUsernames, setTempUsernames] = React.useState<string>("");

  const handleAssignStudent = async (e) => {
    try {
      const assignRes = await fetch("http://127.0.0.1:5000/api/course/assignStudents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usernames: tempUsernames,
          courseNumber: tempCourseNumber,
          term: tempTerm,
          year: tempYear
        }),
      });
      
      setShow(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div >
      <button className="btn btn-tertiary" onClick={() => setShow(true)}>
        <h6 style={{ margin: "5px"}}>Add a Student to a Course</h6> 
      </button>

      <Modal show={show} onHide={() => setShow(false)} dialogClassName="modal-lg" aria-labelledby="example-custom-modal-styling-title">
        <Modal.Header closeButton>
          <Modal.Title id="example-custom-modal-styling-title">Add a Student to a Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAssignStudent}>
          <Row>
              <Col>
              <Form.Select required onChange={(e) => setTempTerm(e.target.value as Term)}>
                <option> Select Term</option>
                <option value={Term.Fall} >Fall</option>
                <option value={Term.Winter}>Winter</option>
                <option value={Term.Summer}>Summer</option>
              </Form.Select>
              </Col>
              <Col>
              <Form.Select required onChange={(e) => setTempYear(parseInt(e.target.value))}>
                <option> Select Year</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
              </Form.Select>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Control required type="tempCourseNumber" 
                  placeholder="Please enter the course number (ex. COMP 307)." value={tempCourseNumber} onChange={(e) => setCourseNumber(e.target.value)} />
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Control required type="tempUsername" 
                  placeholder="Please enter a list of student usernames (ex. jvybihal, jadoe, jodoe)." 
                  value={tempUsernames} 
                  onChange={(e) => setTempUsernames(e.target.value)} />
            </Col>
            </Row>
            <Button className="mt-3" variant="light" type="submit">
              Add
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AssignStudentForm;
