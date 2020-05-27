import React, {useEffect} from "react";
import axios from 'axios';
import querystring from 'querystring';
import getStatus from "./GetStatus.jsx";
import serverUrl from "./ServerUrl.jsx";

function Position(props) {
  const position = props.position;
  const delayTime = 1000;

  // FIX ME - is this even necessary?
  useEffect(() => {
    console.log("In Position useEffect. Position is " + position);
  }, [position]);

  var reqSeat;

  function seatSelected(event) {
    reqSeat = event.target.dataset.seat;
    console.log("User wants to play for " + reqSeat);
  }

  function submitHandler(event) {
    // I want to see what the user entered
    var tblName = document.getElementById("tblNameId").value;
    console.log("User wants to join table " + tblName);
    var seatObj = {tableName: tblName, seat: reqSeat};
    const url = serverUrl + 'sit';
    axios.post(url, querystring.stringify(seatObj))
    .then((response) => {
      console.log("Axios got response status " + response.status);
      console.log("Axios got response text " + response.statusText);
      console.log("You are at table " + response.data.tableName);
      console.log("Assigned seat is " + response.data.assignedSeat);
      seatObj = {tableName: response.data.tableName, seat: response.data.assignedSeat};
      props.setPosition(seatObj);
    }, (error) => {
      console.log(error);
    });

    setTimeout(function() {
      getStatus(props.state, props.setFx, tblName);
    }, delayTime);
  }

  return (
    <div>
      {(position == undefined) ? (
        <div className="position">
          <h3>Select A Table by Name</h3>
          <input id="tblNameId" type="text" name="tblName" size="16" placeholder="Table Name?" />
          <h3>Select A Seat at the Table</h3>
          <div className="dropdown">
            <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Position
            </button>
            <div className="dropdown-menu" aria-labelledby="dropdownMenu2">
              <button className="dropdown-item" type="button" data-seat="North" onClick={seatSelected} >North</button>
              <button className="dropdown-item" type="button" data-seat="South" onClick={seatSelected} >South</button>
            </div>
            <button className="btn btn-primary btn-submit" onClick={submitHandler} type="button">
              Submit
            </button>
          </div>
        </div>
      ) : (null)
      }
   </div>
  )
}

export default Position;
