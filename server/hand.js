//jshint esversion:6

// Require the card module
const suitModule = require(__dirname + "/suit.js");

// Require the card module
const card = require(__dirname + "/card.js");


function calcHCP(cards) {
  var hcp = 0;
  cards.forEach(function(card) {
    hcp += card.getHcpValue();
  });
  return hcp;
};

/* The hand distribution is an array of 4 numbers.
 * The index represents the suit:
 * 0: club, 1: diamond, 2: heart, 3:spade
 * Take note that this order is opposite of that usually used by humans.
 * The value is the number of cards in the hand of that suit.
 */
function calcDistribution(hand, cards) {
  hand.distribution = [0, 0, 0, 0];
  hand.isBalanced = true;
  cards.forEach(function(card) {
    var index = suitModule.Suit[card.suit] - 1;
    hand.distribution[index]++;
    // console.log(card.suit + ' - ' + index + ' - ' + numCardsPerSuit[index]);
  });
  hand.distPts = 0;
  var foundDoubleton = false;
  hand.distribution.forEach(function(numCards){
    if (numCards > 4) {
      hand.distPts += numCards - 4;
    }
    if (numCards < 2) {
      hand.isBalanced = false;
    }
    if (numCards === 2) {
      if (foundDoubleton) {
        hand.isBalanced = false;
      } else {
        foundDoubleton = true;
      }
    }
  });
};

function calcTotalPts(hand) {
  return hand.hcPts + hand.distPts;
};

function getLenOfTwoLongestSuits(hand) {
  var longestSuitIndex;
  var firstMaxLen = 0;
  var secondMaxLen = 0;
  //console.log(hand.distribution);
  hand.distribution.forEach(function(suitLen, index) {
    if (suitLen >= firstMaxLen) {
      if (firstMaxLen != 0) {
        secondMaxLen = firstMaxLen;
      }
      firstMaxLen = suitLen;
      longestSuitIndex = index;
    } else if (suitLen === firstMaxLen) {
      secondMaxLen = suitLen;
      if (suitLen >= 5 && index >= 2) {
        longestSuitIndex = index;
      }
    } else if (suitLen > secondMaxLen) {
      secondMaxLen = suitLen;
    }
  });
  //console.log("Longest: " + firstMaxLen + "  Second: " + secondMaxLen);
  var totalLen = firstMaxLen + secondMaxLen;
  var suit;
  switch (longestSuitIndex) {
    case 3: suit = 'S'; break;
    case 2: suit = 'H'; break;
    case 1: suit = 'D'; break;
    case 0: suit = 'C'; break;
  };
  //console.log("Best suit: " + suit + " Len: " + firstMaxLen + " Index: " + longestSuitIndex);
  return {suit: suit, index: longestSuitIndex, length: totalLen};
}

function calcOpenBid(hand) {
  if (hand.totalPts >= 25 && hand.isBalanced) {
    return {suit: 'NT', level: 3};
  }
  if (hand.totalPts >= 22 && hand.totalPts < 25 && hand.isBalanced) {
    return {suit: 'NT', level: 2};
  }
  if (hand.totalPts >= 22 && hand.totalPts < 27) {
    return {suit: 'C', level: 2};
  }
  if (hand.totalPts >= 15 && hand.totalPts <= 17 && hand.isBalanced) {
    return {suit: 'NT', level: 1};
  }
  if (hand.totalPts >= 13 && hand.totalPts <= 21) {
    if (hand.distribution[3] >= 5) {
      return {suit: 'S', level: 1};
    }
    if (hand.distribution[2] >= 5) {
      return {suit: 'H', level: 1};
    }
    if (hand.distribution[1] >= 5) {
      return {suit: 'D', level: 1};
    }
    if (hand.distribution[0] >= 3 && hand.distribution[0] >= hand.distribution[1]) {
      return {suit: 'C', level: 1};
    }
    if (hand.distribution[1] >= 3) {
      return {suit: 'D', level: 1};
    }
  }
  var ruleTwenty = getLenOfTwoLongestSuits(hand);
  if (ruleTwenty.length + hand.hcPts >= 20)  {
    return {suit: ruleTwenty.suit, level: 1};
  }
  if (hand.totalPts >= 11 && hand.totalPts <= 12) {
    if (hand.distribution[ruleTwenty.index] >= 5) {
      return {suit: ruleTwenty.suit, level: 1};
    }
  }
  if (hand.totalPts >= 7 && hand.totalPts <= 11) {
    if (hand.distribution[ruleTwenty.index] >= 7) {
      return {suit: ruleTwenty.suit, level: 3};
    }
  }
  if (hand.totalPts >= 5 && hand.totalPts <= 11) {
    if (hand.distribution[ruleTwenty.index] >= 6) {
      if (ruleTwenty.suit != 'C') {
        return {suit: ruleTwenty.suit, level: 2};
      }
    }
  }
  return {suit: 'C', level: 0};
};

exports.Hand = function(dealtCards) {
  this.handCards = [...dealtCards];
  this.handCards.sort(function(a, b) {
    if (a.index < b.index) {
      return -1;
    }
    if (a.index > b.index) {
      return 1;
    }
    // a must be equal to b
    return 0;
  });
  this.hcPts = calcHCP(dealtCards);
  calcDistribution(this, dealtCards);
  this.totalPts = calcTotalPts(this);
  this.openingBid = calcOpenBid(this);
  this.player = null;
};

exports.getHandEval = function(hand) {
  const distStr = hand.distribution[3] + ' ' + hand.distribution[2] + ' ' +
                   hand.distribution[1] + ' ' + hand.distribution[0];
  const balanceStr = hand.isBalanced ? 'balanced' : 'unbalanced';
  var recommendedBid = 'Pass';
  if (hand.openingBid.level > 0) {
    recommendedBid = hand.openingBid.level + hand.openingBid.suit;
  }

  const handEval = {
    distribution: distStr,
    balance: balanceStr,
    hcp: hand.hcPts,
    distPts: hand.distPts,
    totalPts: hand.totalPts,
    openBid: recommendedBid
  };
  return handEval;
};

exports.show = function(hand) {
  hand.handCards.forEach(function(aCard) {
    aCard.showCard();
  });
  console.log("Distribution: " + hand.distribution[3] + ' ' + hand.distribution[2] + ' ' +
              hand.distribution[1] + ' ' + hand.distribution[0]);
  const balanceStr = hand.isBalanced ? 'balanced' : 'unbalanced';
  console.log("Hand is " + balanceStr);
  console.log("High Card Points: " + hand.hcPts);
  console.log("Distribution Points: " + hand.distPts);
  console.log("Total Points: " + hand.totalPts);
  if (hand.openingBid.level > 0) {
    console.log("Recommended bid: " + hand.openingBid.level + hand.openingBid.suit);
  } else {
    console.log("Recommended bid: Pass");
  }
};
