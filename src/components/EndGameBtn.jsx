import React from "react"
import axios from 'axios';

function EndGame(props) {
  const state = props.state;

  function clickHandler() {
    axios.post('/endGame', null)
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

  return (
    <div>
      <form action="/endGame" method="post">
        <button type="submit" className="btn btn-sm btn-dark ctrl-btn">EndGame</button>
      </form>
    </div>
  )
}

export default EndGame;
