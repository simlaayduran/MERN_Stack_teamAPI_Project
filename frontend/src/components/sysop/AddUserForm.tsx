import { useEffect, useState } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import React from "react";
import AddIcon from "@mui/icons-material/Add";
import { Modal } from "react-bootstrap";
import "../../style/userTable.css";
import { UserTypes } from "../../enums/UserTypes";
import { Term } from "../../enums/Term";
import { parse } from "path";


function AddUserForm({ fetchUserData }) {
  const [show, setShow] = useState(false);
  const [showCoursesStud, setShowCoursesStud] = useState(false);
  const [showCoursesTA, setShowCoursesTA] = useState(false);
  const [tempCoursesStud, setTempCoursesStud] = useState<string>("");
  const [tempCoursesTA, setTempCoursesTA] = useState<string>("");
  const [tempSplitCoursesStudent, setTempSplitCoursesStudent] = useState<Array<string>>([]);
  const [tempSplitCoursesTA, setTempSplitCoursesTA] = useState<Array<string>>([]);
  const [tempEmail, setTempEmail] = useState<string>("");
  const [tempFirstname, setTempFirstname] = useState<string>("");
  const [tempLastname, setTempLastname] = useState<string>("");
  const [tempPassword, setTempPassword] = useState<string>("");
  const [tempUserType, setTempUserType] = useState<Array<UserTypes>>([]);
  const [tempUsername, setTempUsername] = useState<string>("");
  const [tempStudentID, setTempStudentID] = useState<number | null>();
  const [tempTerm, setTempTerm] = useState<Term>();
  const [tempYear, setTempYear] = useState<number>(0);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // CAUTION: Do not hard code the URLs, rather use routers
      const res = await fetch("http://127.0.0.1:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: tempEmail,
          firstName: tempFirstname,
          lastName: tempLastname,
          password: tempPassword,
          userType: tempUserType,
          username: tempUsername,
          studentID: tempStudentID,
        }),
      });

      if (res.status === 201) {
        const data = await res.json();
        setTimeout(() => {
          fetchUserData();
        }, 500);


        setTempSplitCoursesStudent(parseRegisteredCourses(tempCoursesStud));
        setTempSplitCoursesTA(parseRegisteredCourses(tempCoursesTA));
        setShow(false);
      } else {
        alert("Error while adding user.");
      }
    } catch (err) {
      console.log(err);
    }
  };

  //If user was successfully added to db, add/update adequate fields in related db collections.
  useEffect(() => {
    if(tempSplitCoursesStudent.length > 0){
      handleAssignStudentToCourses();
    }
    if(tempSplitCoursesTA.length > 0){
      handleAssignTaToCourses();
    }
  }, [tempSplitCoursesStudent, tempSplitCoursesTA]);

  const handleAssignStudentToCourses =  async () => {
    for(var course of tempSplitCoursesStudent){
      console.log("COURSE " + course);

      try{
        console.log("handle courses called.");
        const res = await fetch("http://127.0.0.1:5000/api/course/assignStudent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: tempUsername,
            term: tempTerm,
            year: tempYear,
            courseNumber: course,
          }),
        })

        console.log("tempUsername " + tempUsername);
        console.log("tempTerm " + tempTerm);
        console.log("tempYear " + tempYear);
        console.log("course " + "///" + course + "///");
  
        if(res.status === 200){
          console.log("handle assign STUD to course WORKS")
        } else{
          alert("Error while adding student user to assigned courses.")
        }
      } catch (err){
        console.log(err);
      }
    }
  }

  const handleAssignTaToCourses =  async () => {
    for(var course of tempSplitCoursesTA){
      console.log("COURSE TA: " + course);

      try{
        console.log("handle courses called.");
        const res = await fetch("http://127.0.0.1:5000/api/course/assignTA", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: tempUsername,
            term: tempTerm,
            year: tempYear,
            courseNumber: course,
          }),
        })
  
        if(res.status === 200){
          console.log("handle assign TA to course WORKS")
        } else{
          alert("Error while adding TA to assigned courses.")
        }
      } catch (err){
        console.log(err);
      }
    }
  }

  function handleCheckbox(e) {
    let existingUserTypes:UserTypes[] = [...tempUserType];
    if (e.target.checked) {
        setUserTypeShowsTrue(e);
        existingUserTypes.push(e.target.value);
    } else {
        setUserTypeShowsFalse(e);
        const index = existingUserTypes.indexOf(e.target.value);
        existingUserTypes.splice(index, 1);
    }
    setTempUserType(existingUserTypes);
  }


  function setUserTypeShowsTrue(e){
    if(e.target.value === "stud"){
      setShowCoursesStud(true);
    }
    else if(e.target.value === "ta"){
      setShowCoursesTA(true);
    }
  }

  function setUserTypeShowsFalse(e){
    if(e.target.value === "stud"){
      setShowCoursesStud(false);
    }
    else if(e.target.value === "ta"){
      setShowCoursesTA(false);
    }
  }

  function showUserTypeCoursesInputForm(bool: Boolean, userType: string){
    if(userType === "stud"){
      return (
        (showCoursesStud) 
          ? <Form.Control type="text"
                      placeholder="Enter registered courses. Ex: COMP 307, COMP 250, COMP 350"
                      value={tempCoursesStud}
                      onChange={(e) => setTempCoursesStud(e.target.value)}/>
          : <></>
      );
    }
    else if (userType === "ta"){
      return (
        (showCoursesTA) 
                ? <Form.Control type="text"
                            placeholder="Enter courses to TA. Ex: COMP 307, COMP 250, COMP 350"
                            value={tempCoursesTA}
                            onChange={(e) => setTempCoursesTA(e.target.value)}/>
                : <></>
      )
    }
  }

  function parseRegisteredCourses(courseList: string){ 

    

      let splitString = courseList.split(",");
      if(splitString[0] === ""){
        splitString = []
      }
      for(let i=0; i<splitString.length; i++){
        let current = splitString[i];
        // Trim all commas and whitespace
        current = current.replace(/[,' ']+/g, "").trim();
        // Add back in a single space 
        current = current.replace(/(\D)(\d)/, "$1 $2");
        splitString[i] = current;
      }
      console.log("Splitted string: " + splitString[0] + " " + splitString[1]);
      return splitString;
    
  }

  return (
    <div>
      <button className="btn btn-tertiary" onClick={() => setShow(true)}>
        <h3>Click to register</h3>
      </button>

      <Modal show={show} onHide={() => setShow(false)} 
                dialogClassName="modal-lg" 
                aria-labelledby="example-custom-modal-styling-title">
        <Modal.Header closeButton onClick={() => window.location.reload()}>
          <Modal.Title id="example-custom-modal-styling-title">Add a User</Modal.Title>
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
                                placeholder="Enter a username" 
                                value={tempUsername} 
                                onChange={(e) => setTempUsername(e.target.value)} />
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Control required type="firstName" 
                                placeholder="Enter the first name of the user" 
                                value={tempFirstname} 
                                onChange={(e) => setTempFirstname(e.target.value)} />
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Control required type="lastName" 
                                placeholder="Enter the last name of the user" 
                                value={tempLastname} 
                                onChange={(e) => setTempLastname(e.target.value)} />
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Control required type="email" 
                                placeholder="abc@xyz.com" 
                                value={tempEmail} 
                                onChange={(e) => setTempEmail(e.target.value)} />
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Control required type="password" 
                                placeholder="Enter temporary password" 
                                value={tempPassword} 
                                onChange={(e) => setTempPassword(e.target.value)} />
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Control type="number" 
                                placeholder="Enter an 8-digit student ID" 
                                value={tempStudentID} 
                                onChange={(e) => setTempStudentID(parseInt(e.target.value))} />
              </Col>
            </Row>
            

            <Row>
              <Col>
              <Form.Check inline type="checkbox" label="Student" value="stud" onChange={handleCheckbox}/>
              {showUserTypeCoursesInputForm(showCoursesStud, "stud")}

              <Form.Check inline type="checkbox" label="Professor" value="prof" onChange={handleCheckbox}/>

              <Form.Check inline type="checkbox" label="TA" value="ta" onChange={handleCheckbox}/>
              {showUserTypeCoursesInputForm(showCoursesTA, "ta")}

              <Form.Check inline type="checkbox" label="Admin" value="admin" onChange={handleCheckbox}/>
              <Form.Check inline type="checkbox" label="Sysop" value="sysop" onChange={handleCheckbox}/>
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

export default AddUserForm;
