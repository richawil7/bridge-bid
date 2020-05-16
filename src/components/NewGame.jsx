import React, {useEffect} from "react"
import axios from 'axios';
import getStatus from "./GetStatus.jsx"

function NewGame(props) {
  const state = props.state;
  const delayTime = 1000;

  useEffect(() => {
    console.log("In NewGame useEffect. Delta=" + state.delta);
  }, [state.delta]);

  {return (
    <div>
      <form action="/newGame" method="post">
        <button type="submit"
                onClick={() => {
                  const newGameNum = props.state.gameNum + 1;
                  console.log("New game number " + newGameNum);
                  setTimeout(function() {
                    props.setFx({...props.state, gameNum: newGameNum});
                    getStatus(props.state, props.setFx);
                  }, delayTime, newGameNum);
                }} >New Game</button>
      </form>
    </div>
  )}
}

export default NewGame;
