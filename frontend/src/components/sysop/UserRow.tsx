import React, { useState, useEffect } from "react";
import RemoveIcon from "@material-ui/icons/Remove";
import "../../style/userTable.css";
import { User } from "../../classes/User";
import { CheckSharp } from "@mui/icons-material";

const UserRow = ({ user, fetchUserData }: { user: User; fetchUserData: Function }) => {
  const [show, setShow] = useState(false);

  const handleDeleteUser = async () => {
    try {
      let req = await fetch("http://127.0.0.1:5000/api/users/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        })
      });

      if (req.status === 401) {
        alert("Error while deleting user.");
      }
    } catch (err) {
      console.log(err);
    }

    fetchUserData();
  };

  const handleVerifyUser = async () => {
    try {
      let req = await fetch("http://127.0.0.1:5000/api/users/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        })
      });
      console.log("called")
      if (req.status === 401) {
        alert("Error while deleting user.");
      }
    } catch (err) {
      console.log(err);
    }

    fetchUserData();
  };

  return (
    <tr className="body">
      <td className="column0">
        <button className="btn btn-secondary" onClick={handleDeleteUser}>
          <RemoveIcon />
        </button>
      </td>
      <td className="column1">{user.email}</td>
      <td className="column2">{user.firstName}</td>
      <td className="column3">{user.lastName}</td>
      <td className="column5">{user.userType.join(", ")}</td>
      <td className="column6">
        {user.verified == false && <div><button className="btn btn-secondary" onClick={handleVerifyUser}>
          <CheckSharp /></button></div>
        } </td>
    </tr>
  );
};

export default UserRow;
