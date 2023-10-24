import React, { useState, useEffect } from "react";
import "../../style/userTable.css";
import { ITAwishlist } from "../../classes/TAwishlist";

const TAwishlist_InfoRow = ({ tawishlist}: { tawishlist: ITAwishlist}) => {
  const [show, setShow] = useState(false);

return (
    <tr className="body">
      <td className="column0"></td>
      <td className="column1">{tawishlist.username_prof}</td>
      <td className="column2">{tawishlist.username_ta}</td>
      <td className="column3">{tawishlist.courseNumber}</td>
      <td className="column4">{tawishlist.term}</td>
      <td className="column5">{tawishlist.year}</td>
      <td className="column6">{tawishlist.info}</td>
    </tr>
  );
}; 

export default TAwishlist_InfoRow;