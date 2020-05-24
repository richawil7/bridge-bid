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

exports.getBid = function(player, curBid) {
  if (player.isHuman) {
    // Ask the user for their bid
    return {suit: player.hand.openingBid.suit, level: player.hand.openingBid.level};
  } else {
    // Computer is representing this player
    if (curBid.level === 0) {
      // No non-pass bids have been made yet
      if (player.hand.openingBid.level > 0) {
        // console.log(this.position + " has opening hand and bids " + this.hand.openingBid.level + this.hand.openingBid.suit);
        return player.hand.openingBid;
      } else {
        // console.log(this.position + " does not have an opening hand and passes");
        return {suit: 'C', level: 0};
      }
    } else {
      // console.log(this.position + " passes due to current bid of " + curBid.level + curBid.suit);
      return {suit: 'C', level: 0};
    }
  }
}

function Player(position, isHuman) {
  this.position = position;
  this.isHuman = isHuman;
  this.hand = null;
}

exports.Player = Player;
