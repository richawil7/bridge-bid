import React, {useEffect} from "react"
import { useSSE } from 'react-hooks-sse';
import axios from 'axios';
import getStatus from "./GetStatus.jsx"

function NewGame(props) {
  const state = props.state;
  const delayTime = 2* 1000;

  const remoteNewGame = useSSE('newGameEvent', {
    value: 0
  });

  useEffect(() => {
    console.log("In NewGame useEffect: remote new game event");
    getStatus(props.state, props.setFx);
  }, [remoteNewGame.value]);

  function clickHandler() {
    axios.post('/newGame', null)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
    setTimeout(function() {
      // props.setFx({...props.state, gameNum: newGameNum});
      getStatus(props.state, props.setFx);
    }, delayTime, newGameNum);
  }

  {return (
    <div>
        <button type="button"
                onClick={clickHandler} >New Game</button>
    </div>
  )}
}

export default NewGame;
