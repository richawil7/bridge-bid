import React from "react";

function Card(props) {
  const suit = props.suit;
  const level = props.level;
  const bidStr = level + ' of ' + suit;
  return (
      <p>Your card is {bidStr}</p>
  );
}

export default Card;
