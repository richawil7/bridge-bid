import React, {useEffect} from "react";
import { useSSE } from 'react-hooks-sse';
import getStatus from "./GetStatus.jsx"

function Status(props) {
  const state = props.state;

  const refreshIndex = useSSE('refreshEvent', {
    value: 0
  });

  useEffect(() => {
    console.log("In Status useEffect: refresh event");
    getStatus(props.state, props.setFx, props.position.tableName);
  }, [refreshIndex.value]);

  useEffect(() => {
    console.log("In Status useEffect");
  }, [state.epoch]);

  return (
    <div className="section">
      <h3>Status</h3>
      <div id="statusDiv">
        <h6>You are playing for {props.position.seat}</h6>
        <h6>Dealer is {state.dealer}</h6>
        <h6>{state.message}</h6>
      </div>
    </div>
  );
}

export default Status;
