import React, {useEffect} from "react";

function Status(props) {
  const state = props.state;


  useEffect(() => {
    console.log("In Status useEffect");
  }, [state.message]);

  return (
    <div>
      <h3>Show Status</h3>
      <p>Dealer is {state.dealer}</p>
      <p>{state.message}</p>
    </div>
  );
}

export default Status;
