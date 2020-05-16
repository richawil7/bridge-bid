import React, {useState, useEffect} from "react";
import Card from "./Card.jsx";
import axios from "axios";

function Hand(props) {
  const [handState, setHandState] = useState({
    hand: [],
    valid: false
  });

  useEffect(() => {
    const url = 'http://localhost:3000/' + props.position + '/hand'
    axios.get(url)
      .then(response => {
          console.log(response);
          if (response.data.length == 13) {
            setHandState({hand: response.data, valid: true});
          } else {
            console.log("Hand not yet ready");
          }
      })
      .catch(function (error) {
          console.log("Error in axios: " + error);
      });
  }, [props.state.gameNum]);

  return (
    <div>
      {handState.valid ? (
        handState.hand.map(function(card, index) {
          return (<Card key={index} suit={card.suit} level={card.value} />)
        })
      ) : (
        <p>Hand has not yet been dealt</p>
      )}
    </div>
  );

}

export default Hand;
