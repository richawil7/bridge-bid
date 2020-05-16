//jshint esversion:6

// Require the card module
const card = require(__dirname + "/card.js");

// Get the array of suits from the suit module
const suitModule = require(__dirname + "/suit.js");

// Get the array of card values from the card value module
const cvModule = require(__dirname + "/cardValue");

const Deck = [];

function createDeck() {
  suitModule.Suits.forEach(function(suit) {
    cvModule.Levels.forEach(function(level) {
      myCard = new card.BridgeCard(level, suit);
      Deck.push(myCard);
    });
  });
}

function dealDeck() {
  // Copy the unshuffled Deck
  var shuffled = [...Deck];

  // Use an in-place array sort to shuffle the cards.
  // The function passed to sort is the comparison function to decide the order
  shuffled.sort(function () {
    return Math.random() - 0.5;
  });

  // Define an array to hold four hands
  var hands = [[], [], [], []];
  var cardIndex = 0;
  for (i=0; i<13; i++) {
    for (j=0; j<4; j++) {
      hands[j].push(shuffled[cardIndex]);
      cardIndex++;
    };
  };
  return hands;
}

module.exports.dealDeck = dealDeck;
module.exports.createDeck = createDeck;
