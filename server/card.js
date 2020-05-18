//jshint esversion:6
const path = require('path');

// Get the array of suits from the suit module
const suitModule = require(__dirname + "/suit.js");

// Get the array of card values from the card value module
const cvModule = require(__dirname + "/cardValue");

function calcCardIndex(suit, value) {
  const suitIndex = 4 - suitModule.Suit[suit];
  const cardIndex = 14 - cvModule.CardValue[value];
  return suitIndex * 13 + cardIndex;
}

function Card(value, suit) {
    this.suit = suit;
    this.value = value;
    this.index = calcCardIndex(suit, value);
    this.showCard = function() {
       const cardIndex = cvModule.CardValue[this.value];
       const cardProps = cvModule.CardValue.properties[cardIndex];
       const suitIndex = suitModule.Suit[this.suit];
       const suitProps = suitModule.Suit.properties[suitIndex];
       console.log(this.index + ') ' + cardProps.name + ' of ' + suitProps.name + 's');
    }
}

exports.BridgeCard = function(value, suit) {
  Card.call(this, value, suit);
  switch (value) {
    case '2', '3', '4', '5', '6', '7', '8', '9', '10':
    default:
      this.hcp = 0;
      break;
    case 'A':
      this.hcp = 4;
      break;
    case 'K':
      this.hcp = 3;
      break;
    case 'Q':
      this.hcp = 2;
      break;
    case 'J':
      this.hcp = 1;
      break;
  };
  this.getHcpValue = function () {
    return this.hcp;
  }
}
