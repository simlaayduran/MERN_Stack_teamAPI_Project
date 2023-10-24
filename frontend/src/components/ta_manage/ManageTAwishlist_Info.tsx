import React, { useEffect } from "react";
import "../../style/userTable.css";
import { ITAwishlist } from "../../classes/TAwishlist";
import TAwishlist_InfoRow from "./TAwishlist_InfoRow";
import { Container } from "react-bootstrap";
import AddTAwishlist_Info from "./AddTAwishlist_Info";
import { Term } from "../../enums/Term";
import { Button, Form, Row, Col } from "react-bootstrap";

const ManageTAwishlist_Info = ({usernameString}) => {
  const [tawishlist, setTAwishlist] = React.useState<Array<ITAwishlist>>([]);
  const [tempTerm, setTempTerm] = React.useState<Term>();
  const [tempYear, setTempYear] = React.useState<number>();
  const [tempTAUsername, setTempTAUsername] = React.useState<string>();
  const [courseNumber, tempCourseNumber] = React.useState<number>();

  const fetchTAWishlistData = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/ta/wishlisted", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username_prof: usernameString as string
        }),
      });

      const data = await res.json();
      const courseObject = [];
      for (const d of data.wishesPretty) {
        let item = {
          username_prof: d.username_prof,
          username_ta: d.username_ta,
          courseNumber: d.courseNumber,
          term: d.term,
          year: d.year,
          info: d.info,
        }

        courseObject.push(item);
      }
      setTAwishlist(courseObject);
    } catch (err) {
      console.error(err);
    }
  };
  

  useEffect(() => {
    // Load data
    fetchTAWishlistData();
  }, []);

  return (
    <div>
      <Container className="mt-3">
        <div className="rowC">
          <h2 style={{ marginBottom: "20px" }}>Add a TA to Wishlist</h2> 
 

          <AddTAwishlist_Info fetchTAwishlist_InfoData={fetchTAWishlistData} />
        </div>
        <div id="profTable">
          <table>
            <thead>
              <tr>
                <th className="column0"></th>
                <th className="column1">username [Prof]</th>
                <th className="column2">username [TA]</th>
                <th className="column3">course</th>
                <th className="column4">term</th>
                <th className="column5">year</th>
                <th className="column6">info</th>

              </tr>
            </thead>
            <tbody>
              {tawishlist?.map((tawishlist: ITAwishlist, i: number) => {
                if (tawishlist) {
                  return <TAwishlist_InfoRow key={i} tawishlist={tawishlist} />
                }
                return null;
              })}
            </tbody>
          </table>
        </div>
      </Container>
    </div>
  );
};

export default ManageTAwishlist_Info;