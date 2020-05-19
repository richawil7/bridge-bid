import React, {useEffect} from "react";

function HandEval(props) {

  useEffect(() => {
    console.log("In HandEval useEffect");
  }, [props.showEval]);

  return (
    <div>
      {(props.showEval) ? (
          <div>
            <h3>Hand Evaluation</h3>
            <div className="showEval">
              <p>Distribution: {props.handEval.distribution}</p>
              <p>Balance: {props.handEval.balance}</p>
              <p>High Card Points: {props.handEval.hcp}</p>
              <p>Distribution Points: {props.handEval.distPts}</p>
              <p>Total Points: {props.handEval.totalPts}</p>
              <p>Opening Bid: {props.handEval.openBid}</p>
            </div>
          </div>
          )
        : (null)
      }
   </div>
  )
}

export default HandEval;
