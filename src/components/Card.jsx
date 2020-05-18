import React from "react";
import path from "path";

function Card(props) {
  const suit = props.suit;
  const level = props.level;
  const bidStr = level + ' of ' + suit;
  var imgFile  = "/images/cards/" + level + suit + ".png";
  return (
      <img src={imgFile} width='60' height='80' alt={bidStr}/>
  );
}

export default Card;
