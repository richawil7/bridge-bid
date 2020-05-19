import React, {useEffect} from "react";
import axios from 'axios';
import querystring from 'querystring';
import getStatus from "./GetStatus.jsx";

function Position(props) {
  const position = props.position;
  const delayTime = 1000;

  useEffect(() => {
    console.log("In Position useEffect. Position is " + position);
  }, [position]);

  return (
    <div>
      {(position == undefined) ? (
        <div>
          <input id="posId" type="text" name="position" placeholder="What seat do you want?" />
          <button className="btn btn-sm btn-primary ctrl-btn" type="button"
                  onClick={() => {
                    // I want to see what the user entered
                    var seat = document.getElementById("posId").value;
                    console.log("User wants to play for " + seat);
                    props.setPosition(seat);
                    var seatObj = {seat: seat};
                    axios.post('http://localhost:3000/sit', querystring.stringify(seatObj));
                    setTimeout(function() {
                      getStatus(props.state, props.setFx);
                    }, delayTime);
                  }} >Choose Seat</button>
        </div>
      ) : (null)
      }
   </div>
  )
}

export default Position;
