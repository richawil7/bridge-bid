import React, {useEffect} from "react";
import getStatus from "./GetStatus.jsx";

const delayTime = 1000;


function Start(props) {
  function handleForm(event) {
    // Store reference to form to make later code easier to read
    const form = event.target;

    // Post data using the Fetch API
    fetch(form.action, {
      method: form.method
    })
    // We turn the response into text as we expect HTML
    .then(res => res.text());

    event.preventDefault();
    console.log("handleForm: prevented default action");
  }

  useEffect(
    () => {
      var form = document.getElementById("startForm");
      form.addEventListener('submit', handleForm);
    }
  )

  return (
    <div>
      <form id="startForm" action="/start" method="post">
        <button type="submit" onClick={() => {
          console.log("In startHandler");
          setTimeout(function() {
            getStatus(props.state, props.setFx);
          }, delayTime);
          // event.preventDefault();
        }} >Start</button>
      </form>
    </div>
  );
}

export default Start;
