import React from "react";
import getStatus from "./GetStatus.jsx";

const delayTime = 1000;

function BidEntry(props) {
  return (
    <div>
      <h3>Enter A Bid</h3>
      <form action="/makeBid" method="post">
        <input type="text" name="bid" placeholder="What is your bid?" />
        <button type="submit" >Submit</button>
      </form>
    </div>
  );
}

<form action="/newGame" method="post">
  <button type="submit"
           >New Game</button>
</form>

export default BidEntry;
