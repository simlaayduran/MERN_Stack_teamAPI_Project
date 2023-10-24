import React, { useState, useEffect } from "react";
import RemoveIcon from "@material-ui/icons/Remove";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import "../../style/userTable.css";
import { DisplayProfessor } from "../../classes/DisplayProfessor";

const ProfRow = ({ professor, fetchProfData }: { professor: DisplayProfessor; fetchProfData: Function }) => {
  return (
    <tr className="body">
      <td className="column0">{}</td>
      <td className="column1">{professor.email}</td>
      <td className="column2">{professor.firstName}</td>
      <td className="column3">{professor.lastName}</td>
      <td className="column4">{professor.courses}</td>
    </tr>
  );
};

export default ProfRow;
