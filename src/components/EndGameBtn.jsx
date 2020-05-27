import React, {useEffect} from "react"
import { useSSE } from 'react-hooks-sse';

function EndGame(props) {

  const remoteEndGame = useSSE('endGameEvent', {
    value: false
  });

  useEffect(() => {
    console.log("In EndGame useEffect: remote end game event");
    props.setFx({...props.state, statusMsg: 'Session has been ended. Thank you for playing.'});
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
