import React from "react";
import path from "path";

function Card(props) {
  const suit = props.suit;
  const level = props.level;
  const bidStr = level + ' of ' + suit;
  var imgFile  = "/images/cards/" + level + suit + ".png";
  const cardIndex = 'card' + props.index;
  return (
    <img id={cardIndex} className='card' src={imgFile} alt={bidStr} />
  );
}

export default Card;
