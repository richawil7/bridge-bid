import React from 'react';
import axios from 'axios';

function RebidBtn() {

  function clickHandler() {
    // Ask the server for the evaluation for my hand
    const url = 'http://192.168.1.5:3000/rebid'
    axios.post('/rebid', null)
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
