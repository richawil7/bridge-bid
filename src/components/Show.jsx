import React, {useEffect} from "react";

function Show(props) {
  const state = props.state;

  useEffect(() => {
    console.log("In Show useEffect");
  }, [state.delta]);

  return (
    <div>
      <h3>Debug Status</h3>
      <p>Message: {state.message}</p>
      <p>Bidder: {state.bidder}</p>
      <p>Dealer: {state.dealer}</p>
      <p>GameNum: {state.gameNum}</p>
      <p>Delta: {state.delta}</p>
    </div>
  );
}

export default Show;
