//jshint esversion:6
const Suits = ['C', 'D', 'H', 'S'];

const Suit = {
  C: 1,
  D: 2,
  H: 3,
  S: 4,
  NT: 5,
  properties: {
    1: {name: "Club", value: 1, symbol: "C"},
    2: {name: "Diamond", value: 2, symbol: "D"},
    3: {name: "Heart", value: 3, symbol: "H"},
    4: {name: "Spade", value: 4, symbol: "S"},
    5: {name: "NoTrump", value: 5, symbol: "NT"}
  }
};

module.exports.Suits = Suits;
module.exports.Suit = Suit;
