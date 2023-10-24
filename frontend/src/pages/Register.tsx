import React, { useContext, useState } from "react";
import AddUserForm from "../components/sysop/AddUserForm";
import { Link } from "react-router-dom";
import logo from "../assets/images/mcgill_logo.jpg";
import "../App.css";
import "../style/register.css";
import { User } from "../classes/User";

const Register: React.FC = () => {
    const [users, setUsers] = React.useState<Array<User>>([]);
    const fetchUserData = async () => {
        try {
          const res = await fetch("http://127.0.0.1:5000/api/users");
          const json = await res.json();
          setUsers(json.users);
        } catch (err) {
          console.log(err);
        }
      }; 

  return (
    <div className="register">
        <div className="form-inner">
          <img className="logo" src={logo} alt="mcgill-logo" />
            <div className="addUserFormWrapper">
              <div className="addUserForm"><AddUserForm fetchUserData={fetchUserData}/></div>
            </div>
            <div className="LoginLink">
              <div className="btn btn-tertiary">
                <Link to="/login">Return to Login</Link>
              </div>
            </div>
        </div>
    </div>
  );
};


export default Register;