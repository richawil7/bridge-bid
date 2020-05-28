import React from "react";
import axios from 'axios';
import querystring from 'querystring';
import serverUrl from "./ServerUrl.jsx";

function ChatInput(props) {

  function clickHandler() {
    // I want to see what the user entered
    const msg = document.getElementById("chatInId").value;
    // Send the message to the server
    const url = serverUrl + props.position.tableName + '/' + props.position.seat + '/chatInput';
    const msgObj = {message: msg};
    document.getElementById("chatInId").value = "";
    axios.post(url, querystring.stringify(msgObj))
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  return (
      <div>
        <input id="chatInId" type="text" name="chatIn" placeholder="Type message here" />
        <button id="chatInBtn" type="button" onClick={clickHandler} >Submit</button>
      </div>
  )
}

export default ChatInput;
