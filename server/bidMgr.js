// jshint esversion:6

// Require the card module
const card = require(__dirname + "/card.js");

// Require the deck module
const deck = require(__dirname + "/deck.js");

// Require the hand module
const handModule = require(__dirname + "/hand.js");

// Require the player module
const playerModule = require(__dirname + "/player.js");


function assignHandsToPlayers(hands, players) {
  var handIndex;
  for (handIndex = 0; handIndex < 4; handIndex++) {
    hands[handIndex].player = null;
  }
  players['North'].hand = null;
  players['East'].hand = null;
  players['South'].hand = null;
  players['West'].hand = null;

  // Give the first non-pass hand to North
  handIndex = 0;
  do {
    if (hands[handIndex].openingBid.level != 0) {
      players['North'].hand = hands[handIndex];
      hands[handIndex].player = players['North'];
      // console.log("North got hand " + handIndex);
      break;
    }
    handIndex++;
  }
  while (handIndex < 4);
  if (handIndex === 4) {
    // console.log("All passes ");
    // We had no opening bids. Give North the first hand
    players['North'].hand = hands[0];
    hands[0].player = players['North'];

    // We had no opening bids. Give South the last hand
    players['South'].hand = hands[3];
    hands[3].player = players['South'];

    // Assign the last 2 handCards
    players['East'].hand = hands[1];
    hands[1].player = players['East'];

    players['West'].hand = hands[2];
    hands[2].player = players['West'];
    return;
  }

  // Give the next non-pass hand to South
  handIndex++;
  while (handIndex < 4) {
    if (hands[handIndex].openingBid.level != 0) {
      players['South'].hand = hands[handIndex];
      hands[handIndex].player = players['South'];
      // console.log("South got hand " + handIndex);
      break;
    }
    handIndex++;
  }
  if (handIndex === 4) {
    // console.log("No more non-pass hands for South");
    // We had no more opening bids. Give South the first hand
    players['South'].hand = hands[0];
    hands[0].player = players['South'];

    players['East'].hand = hands[1];
    hands[1].player = players['East'];

    players['West'].hand = hands[2];
    hands[2].player = players['West'];
    return;
  }

  // Give out the last 2 hands
  handIndex = 0;
  while (handIndex < 4) {
    if (hands[handIndex].player === null) {
      players['East'].hand = hands[handIndex];
      hands[handIndex].player = players['East'];
      // console.log("East got hand " + handIndex);
      handIndex++;
      break;
    }
    handIndex++;
  }
  while (handIndex < 4) {
    if (hands[handIndex].player === null) {
      players['West'].hand = hands[handIndex];
      hands[handIndex].player = players['West'];
      // console.log("West got hand " + handIndex);
      break;
    }
    handIndex++;
  }
  return;
}

function numPlayers(players) {
  var count = 0;
  if (players['North'] != null) {
    count++;
  }
  if (players['East'] != null) {
    count++;
  }
  if (players['South'] != null) {
    count++;
  }
  if (players['West'] != null) {
    count++;
  }
  return count;
}

/********************************************************************/

// Global objects
var allPlayersJoined;

// Exported Functions

function init() {
  console.log("Bid manager init");
  allPlayersJoined = false;

  // Get a deck of cards
  deck.createDeck();
}

function joinPlayer(players, position, isHuman) {
  // Check if this player already exists
  if (players[position] == null) {
    players[position] = new playerModule.Player(position, isHuman);
  } else {
    console.log("Already have a player sitting at " + position);
    return false;
  }

  // Check how many players we have at the table
  var playerCount = numPlayers(players);
  console.log("You have " + playerCount + " players");
  if (playerCount == 4) {
    console.log("All players have joined");
    allPlayersJoined = true;
    // console.log(players);
  }
  return true;
}

function newGame(players) {
  if (!allPlayersJoined) {
    console.log("Cannot start a game without all the players");
    return;
  }

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
  handModule.show(players['North'].hand);
}

function quitPlayer(players, position) {
  if (players[position] != null) {
    players[position] = null;
  }
  if (players['East'] != null) {
    players['East'] = null;
  }
  if (players['West'] != null) {
    players['West'] = null;
  }
}

function getNextPlayer(player) {
  return playerModule.getNextPlayer(player);
}

function allPlayers() {
  return allPlayersJoined;
}

exports.init = init;
exports.joinPlayer = joinPlayer;
exports.newGame = newGame;
exports.quitPlayer = quitPlayer;
exports.getNextPlayer = getNextPlayer;

exports.allPlayers = allPlayers;
exports.numPlayers = numPlayers;
