import { useEffect, useState } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import React from "react";
import AddIcon from "@mui/icons-material/Add";
import { Modal } from "react-bootstrap";
import "../../style/userTable.css";
import { Term } from "../../enums/Term";


function AddProfessorRatingForm({ fetchProfessorRatingData }) {
  const [show, setShow] = useState(false);  
  const [tempTerm, setTempTerm] = useState<Term>();
  const [tempYear, setTempYear] = useState<number>(0);
  const [tempUsernameProf, setTempUsernameProf] = useState<string>("");
  const [tempUsernameTA, setTempUsernameTA] = useState<string>("");
  const [tempCourse, setTempCourse] = useState<string>("");
  const [tempComment, setTempComment] = useState<string>("");



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // CAUTION: Do not hard code the URLs, rather use routers
      const res = await fetch("http://127.0.0.1:5000/api/professorRating/rateTA", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username_prof: tempUsernameProf,
            username_ta: tempUsernameTA,
            courseNumber: tempCourse,
            term: tempTerm,
            year: tempYear,
            comment: tempComment,
        }),
      });


      console.log("Status" + res.status);
      console.log("Attributes:");
      console.log("tempUsernameProf " + tempUsernameProf);
      console.log("tempUsernameTA " + tempUsernameTA);
      console.log("tempCourse " + tempCourse);
      console.log("tempTerm " + tempTerm);
      console.log("tempYear " + tempYear);
      console.log("tempComment " + tempComment);
      
      if (res.status === 201) {
        const data = await res.json();
        setTimeout(() => {
            fetchProfessorRatingData();
        }, 500);
        setShow(false);
      } else {
        alert("Error while adding TA rating [student].");
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect( () => {
    
  }, []);

  return (
    <div>
      <button className="mb-4 mt-2" onClick={() => setShow(true)}>
        <AddIcon />
      </button>

      <Modal show={show} onHide={() => setShow(false)} 
                dialogClassName="modal-lg" 
                aria-labelledby="example-custom-modal-styling-title">
        <Modal.Header closeButton>
          <Modal.Title id="example-custom-modal-styling-title">Rate a TA</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col>
              <Form.Select onChange={(e) => setTempTerm(e.target.value as Term)}>
                <option>Please Select Term</option>
                <option value={Term.Fall} >Fall</option>
                <option value={Term.Winter}>Winter</option>
                <option value={Term.Summer}>Summer</option>
              </Form.Select>
              </Col>
              <Col>
              <Form.Select onChange={(e) => setTempYear(parseInt(e.target.value))}>
                <option>Please Select Year</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
              </Form.Select>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Control required type="username" 
                                placeholder="Enter your username" 
                                value={tempUsernameProf} 
                                onChange={(e) => setTempUsernameProf(e.target.value)} />
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Control required type="username" 
                                placeholder="Enter username of TA" 
                                value={tempUsernameTA} 
                                onChange={(e) => setTempUsernameTA(e.target.value)} />
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Control type="text"
                        placeholder="Enter course. (Ex: COMP 307)"
                        value={tempCourse}
                        onChange={(e) => setTempCourse(e.target.value)}/>
              </Col>
              <Form.Text id="courseHelpBlock" muted>
                 Please follow course input format. Ex: "COMP 307". Do not include preceeding or succeeding spaces.
            </Form.Text>
            </Row>

            <Row>
              <Col>
                <Form.Control as="textarea"
                placeholder="Enter any comments/notes you may have about the TA in question" 
                value={tempComment}
                onChange={(e) => setTempComment(e.target.value)}/>

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
}

export default AddProfessorRatingForm;