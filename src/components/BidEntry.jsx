import React from "react";
import axios from 'axios';
import querystring from 'querystring';
import serverUrl from "./ServerUrl.jsx";

function BidEntry(props) {

  return (
    <div className='bidEntry' >
      <h3>Enter A Bid</h3>
      <div>
        <input id="bidId" type="text" name="bid" placeholder="What is your bid?" />
        <button type="button" className="btn btn-sm btn-primary ctrl-btn"
          onClick={() => {
            // I want to see what the user entered
            var bidStr = document.getElementById("bidId").value;
            console.log("User bid " + bidStr);
	          const url = serverUrl + position.tableName + '/' + position.seat + '/makeBid';
            axios.post(url, bidStr);
          }} >Submit
          </button>
      </div>
    </div>
  );
}

export default BidEntry;
