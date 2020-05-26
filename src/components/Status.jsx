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
    getStatus(props.state, props.setFx, props.position.tableName);
  }, [numPlayers.value]);

  useEffect(() => {
    console.log("In Status useEffect");
  }, [state.message]);

  return (
    <div className='status'>
      <h3>Status</h3>
      <div id="statusDiv">
        <h4>You are playing for {props.position.seat}</h4>
        <h4>Dealer is {state.dealer}</h4>
        <h4>{state.message}</h4>
      </div>
    </div>
  );
}

export default Status;
