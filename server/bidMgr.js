// jshint esversion:6

// Require the card module
const card = require(__dirname + "/card.js");

// Require the deck module
const deck = require(__dirname + "/deck.js");

// Require the hand module
const handModule = require(__dirname + "/hand.js");

// Require the player module
const playerModule = require(__dirname + "/player.js");

function getPlayer(players, position) {
  var foundPlayer = null;
  for (let i=0; i<4; i++) {
    if (players[i].position === position) {
      foundPlayer =  players[i];
      break;
    }
  };
  return foundPlayer;
}

function assignHandsToPlayers(hands, players) {
  var handIndex;
  const north = getPlayer(players, "North");
  const east = getPlayer(players, "East");
  const south = getPlayer(players, "South");
  const west = getPlayer(players, "West");
  for (handIndex = 0; handIndex < 4; handIndex++) {
    hands[handIndex].player = null;
  }
  north.hand.handCards.length = 0;
  east.hand.handCards.length = 0;
  south.hand.handCards.length = 0;
  west.hand.handCards.length = 0;

  // Give the first non-pass hand to North
  handIndex = 0;
  do {
    if (hands[handIndex].openingBid.level != 0) {
      north.hand = hands[handIndex];
      hands[handIndex].player = 'North';
      // console.log("North got hand " + handIndex);
      break;
    }
    handIndex++;
  }
  while (handIndex < 4);
  if (handIndex === 4) {
    // console.log("All passes ");
    // We had no opening bids. Give North the first hand
    north.hand = hands[0];
    hands[0].player = 'North';

    // We had no opening bids. Give South the last hand
    south.hand = hands[3];
    hands[3].player = 'South';

    // Assign the last 2 handCards
    east.hand = hands[1];
    hands[1].player = 'East';

    west.hand = hands[2];
    hands[2].player = 'West';
    return;
  }

  // Give the next non-pass hand to South
  handIndex++;
  while (handIndex < 4) {
    if (hands[handIndex].openingBid.level != 0) {
      south.hand = hands[handIndex];
      hands[handIndex].player = 'South';
      // console.log("South got hand " + handIndex);
      break;
    }
    handIndex++;
  }
  if (handIndex === 4) {
    // console.log("No more non-pass hands for South");
    // We had no more opening bids. Give South the first hand
    south.hand = hands[0];
    hands[0].player = 'South';

    east.hand = hands[1];
    hands[1].player = 'East';

    west.hand = hands[2];
    hands[2].player = 'West';
    return;
  }

  // Give out the last 2 hands
  handIndex = 0;
  while (handIndex < 4) {
    if (hands[handIndex].player === null) {
      east.hand = hands[handIndex];
      hands[handIndex].player = 'East';
      // console.log("East got hand " + handIndex);
      handIndex++;
      break;
    }
    handIndex++;
  }
  while (handIndex < 4) {
    if (hands[handIndex].player === null) {
      west.hand = hands[handIndex];
      hands[handIndex].player = 'West';
      // console.log("West got hand " + handIndex);
      break;
    }
    handIndex++;
  }
  return;
}

/********************************************************************/

// Exported Functions

function init() {
  console.log("Bid manager init");

  // Get a deck of cards
  deck.createDeck();
}

function dealCards(players) {
  // Deal the cards
  var dealtHands = [];
  var bridgeHands = [];

  // Get the dealer to pass out all the cards into 4 piles
  dealtHands = deck.dealDeck();
  // Oh yeah, we are playing bridge. Create 4 bridge hands using these piles
  for (let i = 0; i < 4; i++) {
    bridgeHands[i] = new handModule.Hand(dealtHands[i]);
  };

  // Assign each bridge hand to a player
  assignHandsToPlayers(bridgeHands, players);
  /*
    handModule.show(players['North'].hand);
    handModule.show(players['South'].hand);
    handModule.show(players['East'].hand);
    handModule.show(players['West'].hand);
    */
  // Show the hand to north
  //handModule.show(players['North'].hand);
}

function getHandEval(players, position) {
  // Find the player in the players array
  for (let i=0; i<4; i++) {
    if (players[i].position === position) {
      return (handModule.getHandEval(players[i].hand));
    }
  }
  return null;
}


exports.init = init;
exports.dealCards = dealCards;
exports.getHandEval = getHandEval;
