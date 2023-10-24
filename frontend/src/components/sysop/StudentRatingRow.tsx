import React, { useState, useEffect } from "react";
import "../../style/userTable.css";
import { StudentRating } from "../../classes/StudentRating";

const StudentRatingRow = ({ studentRating}: { studentRating: StudentRating}) => {
  const [show, setShow] = useState(false);

  
  return (
    <tr className="body">
      <td className="column0"></td>
      <td className="column1">{studentRating.username_stud}</td>
      <td className="column2">{studentRating.username_ta}</td>
      <td className="column3">{studentRating.courseNumber}</td>
      <td className="column5">{studentRating.term}</td>
      <td className="column6">{studentRating.year}</td>
      <td className="column7">{studentRating.rating}</td>
      <td className="column8">{studentRating.comment}</td>
    </tr>
  );
};

export default StudentRatingRow;
