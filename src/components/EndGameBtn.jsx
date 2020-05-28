import React, {useEffect} from "react"
import { useSSE } from 'react-hooks-sse';

function EndGame(props) {
  const state = props.state;
  const remoteEndGame = useSSE('endGameEvent', {
    value: false
  });

  useEffect(() => {
    console.log("In EndGame useEffect: remote end game event");
    const newEpoch = state.epoch + 1;
    props.setFx({...state, message: 'Session has been ended. Thank you for playing.', epoch: newEpoch});
  }, [remoteEndGame.value]);

  const url = '/' + props.position.tableName + '/endGame';
  return (
    <div>
      <form action={url} method="post">
        <button type="submit" className="btn btn-sm btn-dark ctrl-btn">EndGame</button>
     </form>
    </div>
  )
}

export default EndGame;
