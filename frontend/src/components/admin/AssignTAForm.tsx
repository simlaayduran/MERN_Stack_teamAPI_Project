import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import "../../style/userTable.css";
import { Term } from "../../enums/Term";

// Form to define and assign a TA to a Course
const AssignTAForm = ({ fetchCourseData }) => {
  const [show, setShow] = React.useState(false);
  const [tempCourseNumber, setCourseNumber] = React.useState("");
  const [tempTerm, setTempTerm] = React.useState<Term>();
  const [tempYear, setTempYear] = React.useState<number>(0);
  const [tempHours, setTempHours] = React.useState<number>(0);
  const [tempUsername, setTempUsername] = React.useState<string>("");

  const handleAssignTA = async (e) => {
    try {
      const assignRes = await fetch("http://127.0.0.1:5000/api/course/assignTA", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: tempUsername,
          courseNumber: tempCourseNumber,
          term: tempTerm,
          year: tempYear
        }),
      });
      
      // If a value for hours is chosen, we simply fetch and update the TA history record
      if ((tempHours == 90 || tempHours == 180) && assignRes.status == 200)
      {
        const histEntryRes = await fetch("http://127.0.0.1:5000/api/ta/:e", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: tempUsername,
            term: tempTerm,
            year: tempYear
          }),
        });

        if (histEntryRes.status == 200)
        {
          const data = await histEntryRes.json();
          const bodyToSend = "";
          for (const d of data.history) {
            console.log("here");
            const histUpdateRes = await fetch("http://127.0.0.1:5000/api/ta/add", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              term: d.term, 
              year: d.year, 
              username: d.username, 
              studentID: d.studentID,
              isGrad: d.isGrad, 
              supervisorName: d.supervisorName, 
              priorityForCourses: d.priorityForCourses, 
              hours: tempHours, 
              dateApplied: d.dateApplied, 
              location: d.location, 
              phone: d.phone, 
              degree: d.degree, 
              coursesAppliedTo: d.coursesAppliedTo, 
              openToOtherCourses: d.openToOtherCourses, 
              notes: d.notes }),
            });
          }
        }
      }
      setShow(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div >
      <button className="btn btn-tertiary" onClick={() => setShow(true)}>
        <h2 style={{ margin: "20px"}}>Add a TA to a Course</h2> 
      </button>

      <Modal show={show} onHide={() => setShow(false)} dialogClassName="modal-lg" aria-labelledby="example-custom-modal-styling-title">
        <Modal.Header closeButton>
          <Modal.Title id="example-custom-modal-styling-title">Add a TA to a Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAssignTA}>
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
                  placeholder="Please enter the TA's username (ex. jvybihal)." 
                  value={tempUsername} 
                  onChange={(e) => setTempUsername(e.target.value)} />
            </Col>
            </Row>

            <Row>
              <Col>
                <Form.Select onChange={(e) => setTempHours(parseInt(e.target.value))}>
                  <option>Select Hours</option>
                  <option value="90">90</option>
                  <option value="180">180</option>
                </Form.Select>
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

export default AssignTAForm;
