import React, {useEffect} from "react";
import axios from 'axios';

function Position(props) {
  const position = props.position;

  useEffect(() => {
    console.log("In Position useEffect. Position is " + position);
  }, [position]);

  return (
    <div>
      {(position == undefined) ? (
        <div>
          <input id="posId" type="text" name="position" placeholder="What seat do you want?" />
          <button type="button"
                  onClick={() => {
                    // I want to see what the user entered
                    var seat = document.getElementById("posId").value;
                    console.log("User wants to play for " + seat);
                    props.setFx(seat);
                  }} >Choose Seat</button>
        </div>
      ) : (
        <p>You are playing for {position}</p>
      )}
   </div>
  )
}

export default Position;
