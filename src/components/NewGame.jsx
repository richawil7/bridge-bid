import React, {useEffect} from "react"
import { useSSE } from 'react-hooks-sse';
import axios from 'axios';
import getStatus from "./GetStatus.jsx"
import serverUrl from "./ServerUrl.jsx";

function NewGame(props) {
  const state = props.state;
  const delayTime = 2 * 1000;

  const remoteNewGame = useSSE('newGameEvent', {
    value: 0
  });

  useEffect(() => {
    console.log("In NewGame useEffect: remote new game event");
    props.setFx({...props.state, gameNum: state.gameNum + 1});
    getStatus(props.state, props.setFx, props.position.tableName);
  }, [remoteNewGame.value]);

  function clickHandler() {
    const url = serverUrl + props.position.tableName + '/newGame';
    axios.post(url, null)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
    // Disable showing all hands
    props.setShowHand(false);
    // Disable show hand Evaluation
    props.setShowEval(false);
  }

  {return (
    <div id='newGameBtn' >
        <button type="button" className="btn btn-sm btn-success ctrl-btn"
                onClick={clickHandler} >New Game</button>
    </div>
  )}
}

export default NewGame;
