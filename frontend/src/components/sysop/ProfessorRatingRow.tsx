import React, { useState, useEffect } from "react";
import "../../style/userTable.css";
import { ProfessorRating } from "../../classes/ProfessorRating";

const ProfessorRatingRow = ({ professorRating}: { professorRating: ProfessorRating}) => {
  const [show, setShow] = useState(false);

  
  return (
    <tr className="body">
      <td className="column0"></td>
      <td className="column1">{professorRating.username_prof}</td>
      <td className="column2">{professorRating.username_ta}</td>
      <td className="column3">{professorRating.courseNumber}</td>
      <td className="column5">{professorRating.term}</td>
      <td className="column6">{professorRating.year}</td>
      <td className="column7">{professorRating.comment}</td>
    </tr>
  );
};

export default ProfessorRatingRow;
