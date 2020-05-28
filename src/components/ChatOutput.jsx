import React, {useEffect} from "react";
import { useSSE } from 'react-hooks-sse';
import getStatus from "./GetStatus.jsx"
import ChatMsg from "./ChatMsg.jsx";

function ChatOutput(props) {
  const state = props.state;

  const chatIndex = useSSE('chatEvent', {
    value: -1
  });

  useEffect(() => {
    console.log("In ChatOutput useEffect: chat event");
    getStatus(props.state, props.setFx, props.position.tableName);
  }, [chatIndex.value]);

  useEffect(() => {
    console.log("In ChatOutput useEffect: chat state change");
    console.log(state.chats);
  }, [state.epoch]);

  return (
    <div>
      {props.state.chats.map(function(chat, index) {
        return (<ChatMsg key={index} msg={chat} />)
      })}
    </div>
  );
}

export default ChatOutput;
