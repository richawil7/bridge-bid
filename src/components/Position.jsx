import React, {useEffect} from "react";
import axios from 'axios';
import querystring from 'querystring';
import getStatus from "./GetStatus.jsx";
import serverUrl from "./ServerUrl.jsx";

function Position(props) {
  const position = props.position;
  const delayTime = 1000;

  useEffect(() => {
    console.log("In Position useEffect. Position is " + position);
  }, [position]);

  function seatSelected(event) {
    const reqSeat = event.target.dataset.seat;
    console.log("User wants to play for " + reqSeat);
    var seatObj = {seat: reqSeat};
    const url = serverUrl + 'sit';
    axios.post(url, querystring.stringify(seatObj))
    .then((response) => {
      //console.log("Axios got response status " + response.status);
      // console.log("Axios got response text " + response.statusText);
      console.log("Assigned seat is " + response.data);
      props.setPosition(response.data);
    }, (error) => {
      console.log(error);
    });

    setTimeout(function() {
      getStatus(props.state, props.setFx);
    }, delayTime);
  }

  return (
    <div>
      {(position == undefined) ? (
        <div className="position">
          <h3>Select A Seat</h3>
          <div className="dropdown">
            <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Sit
              </button>
              <div className="dropdown-menu" aria-labelledby="dropdownMenu2">
              <button className="dropdown-item" type="button" data-seat="North" onClick={seatSelected} >North</button>
              <button className="dropdown-item" type="button" data-seat="South" onClick={seatSelected} >South</button>
              </div>
          </div>
        </div>
      ) : (null)
      }
   </div>
  )
}

export default Position;
