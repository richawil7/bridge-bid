import React, {useEffect} from "react"
import axios from 'axios';
import getStatus from "./GetStatus.jsx"

function NewGame(props) {
  const state = props.state;
  const delayTime = 2* 1000;

  function clickHandler(myStr) {
    const newGameNum = props.state.gameNum + 1;
    console.log("New game number " + newGameNum);
    console.log(myStr);
    axios.post('/newGame', null)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
    setTimeout(function() {
      props.setFx({...props.state, gameNum: newGameNum});
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
