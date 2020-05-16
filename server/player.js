//jshint esversion:6

exports.getNextPlayer = function(curPlayer) {
  var nextPlayer;
  switch (curPlayer) {
    case 'North':
      nextPlayer = 'East';
      break;
    case 'East':
      nextPlayer = 'South';
      break;
    case 'South':
      nextPlayer = 'West';
      break;
    case 'West':
      nextPlayer = 'North';
      break;
  };
  return nextPlayer;
}

function Player(position, isHuman) {
  this.position = position;
  this.isHuman = isHuman;
  this.hand = null;
  this.setHand = function(hand) {
    this.hand = hand;
  };
  this.getBid = function(curBid) {
    if (this.isHuman) {
      // Ask the user for their bid
      return {suit: this.hand.openingBid.suit, level: this.hand.openingBid.level};
    } else {
      // Computer is representing this player
      if (curBid.level === 0) {
        // No non-pass bids have been made yet
        if (this.hand.openingBid.level > 0) {
          // console.log(this.position + " has opening hand and bids " + this.hand.openingBid.level + this.hand.openingBid.suit);
          return this.hand.openingBid;
        } else {
          // console.log(this.position + " does not have an opening hand and passes");
          return {suit: 'C', level: 0};
        }
      } else {
        // console.log(this.position + " passes due to current bid of " + curBid.level + curBid.suit);
        return {suit: 'C', level: 0};
      }
    }
  };
}

exports.Player = Player;
