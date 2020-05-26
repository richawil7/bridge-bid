import React from "react"
import axios from 'axios';

function EndGame(props) {

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
