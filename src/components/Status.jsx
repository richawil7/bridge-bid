import React, {useEffect} from "react";
import { useSSE } from 'react-hooks-sse';
import getStatus from "./GetStatus.jsx"

function Status(props) {
  const state = props.state;

  const numPlayers = useSSE('playerEvent', {
    value: 0
  });

  useEffect(() => {
    console.log("In Status useEffect: player event");
    getStatus(props.state, props.setFx);
  }, [numPlayers.value]);

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
