import React, { useContext, useState, useEffect } from "react";
import { Container, Nav, Navbar, NavDropdown, Tab, Tabs } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import logo from "../assets/images/mcgill_logo.jpg";
import "../style/subTopbar.css";
import { UserContext } from "../App";
import { UserTypes } from "../enums/UserTypes";
import ManageProfessors from "../components/sysop/ManageProfessors";
import ManageCourses from "../components/sysop/ManageCourses";
import ManageUsers from "../components/sysop/ManageUsers";
import ManageTAs from "../components/admin/ManageTAs";
import ManageAssignments from "../components/admin/ManageAssignments";
import ManageHistory from "../components/admin/ManageHistory";
import ManageStudentRating from "../components/sysop/ManageStudentRating";
import ManageProfessorRating from "../components/sysop/ManageProfessorRating";
import ManageTAwishlist_Info from "../components/ta_manage/ManageTAwishlist_Info";

export function Dashboard() {

  const { user, setUser } = useContext(UserContext);
  const tempUsername = user.username;
  console.log(tempUsername);
  
  const tabsPerProfile = new Map<UserTypes, Array<string>>([
    [UserTypes.Sysop, ["Professors", "Courses", "Users"]],
    [UserTypes.Admin, ["Import TAs", "Add/Remove TA from Course", "TA History"]],
    [UserTypes.Student, ["Rate TA (stud.)"]],
    [UserTypes.Professor, ["Rate TA (prof.)", "TA Wishlist And Info"]],
    [UserTypes.TA, []]
  ]);

  const tabNamesToJSX = new Map<string, JSX.Element>([
    ["Professors", <ManageProfessors />],
    ["Courses", <ManageCourses />],
    ["Users", <ManageUsers />],
    ["Import TAs", <ManageTAs />],
    ["Add/Remove TA from Course", <ManageAssignments />],
    ["TA History", <ManageHistory />],
    ["Rate TA (stud.)", <ManageStudentRating usernameString={tempUsername} />],
    ["Rate TA (prof.)", <ManageProfessorRating usernameString={tempUsername} />],
    ["TA Wishlist And Info", <ManageTAwishlist_Info usernameString={tempUsername}/>],
  ]);

  const navigate = useNavigate();

  // Set a default profile
  const [currentProfile, setCurrentProfile] = useState<UserTypes>(
    ((user && user.verified) ? user.userType[0] : UserTypes.Student)
  );

  // Set the default array of tabs relative to our default profile
  const [currentTabs, setCurrentTabs] = useState<Array<string>>(
    tabsPerProfile.get(currentProfile)!
  );

  // On nav bar selection, this function sets the new current profile and associated tabs.
  function handleNavClick(profile: UserTypes): void {
    setCurrentProfile(profile);
    console.log(user.verified)
    if (user.verified)
    {setCurrentTabs(tabsPerProfile.get(profile)!);}
  }

  function handleLogout(): void {
    navigate("/logout");
  }

    useEffect(() => {
    // if no user redirect to login page
    if (!user.email) {
      navigate("/login");
    }
  }, [user, navigate]); 

  // Render nav dropdown options and nav tabs based on state above
  return (
    <div>
      <Navbar expand="lg">
        <Container>
          <img className="logo" src={logo} alt="mcgill-logo" />
          <Nav className="me-auto">
            <NavDropdown title={currentProfile} id="basic-nav-dropdown">              
              {user.userType.map((profile) => (
                <NavDropdown.Item
                  key={profile.toString()}
                  onClick={() => {
                    handleNavClick(profile);
                  }}
                >
                  {profile}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
          </Nav>
          <button className="logout" onClick={() => handleLogout()}>
            <LogoutIcon />
          </button>
        </Container>
      </Navbar>
      <Container>
        <Tabs
          defaultActiveKey="0"
          transition={false}
          id="noanim-tab"
          className="sub"
        >
          {currentTabs?.map((currentTabName, i) => (
            <Tab className="sub" key={i} eventKey={i} title={currentTabName}>
              {tabNamesToJSX.get(currentTabName)}
            </Tab>
          ))}
        </Tabs>
      </Container>
    </div>
  );
}

export default Dashboard;
