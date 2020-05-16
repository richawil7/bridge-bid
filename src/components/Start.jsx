import React from "react";
import getStatus from "./GetStatus.jsx";

const delayTime = 1000;

function Start(props) {
  return (
    <div>
      <form action="/start" method="post">
        <button type="submit" onClick={() => {
          console.log("In startHandler");
          setTimeout(function() {
            getStatus(props.state, props.setFx);
          }, delayTime);
          //event.preventDefault();
        }} >Start</button>
      </form>
    </div>
  );
}

export default Start;
