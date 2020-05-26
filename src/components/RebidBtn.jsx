import React from 'react';
import axios from 'axios';
import serverUrl from "./ServerUrl.jsx";

function RebidBtn(props) {

  function clickHandler() {
    // Ask the server for the evaluation for my hand
    const url = serverUrl + props.position.tableName + '/rebid';
    axios.post(url, null)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  return (
    <div id='rebidBtn'>
      <button type="button" className="btn btn-sm btn-secondary ctrl-btn"
        onClick={clickHandler} > Rebid
      </button>
    </div>
  );
}

export default RebidBtn;
