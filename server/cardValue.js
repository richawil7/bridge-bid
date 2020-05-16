
const Levels = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const CardValue = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
  properties: {
    2: {name: "Two", value: 2, symbol: "2"},
    3: {name: "Three", value: 3, symbol: "3"},
    4: {name: "Four", value: 4, symbol: "4"},
    5: {name: "Five", value: 5, symbol: "5"},
    6: {name: "Six", value: 6, symbol: "6"},
    7: {name: "Seven", value: 7, symbol: "7"},
    8: {name: "Eight", value: 8, symbol: "8"},
    9: {name: "Nine", value: 9, symbol: "9"},
    10: {name: "Ten", value: 10, symbol: "10"},
    11: {name: "Jack", value: 11, symbol: "J"},
    12: {name: "Queen", value: 12, symbol: "Q"},
    13: {name: "King", value: 13, symbol: "K"},
    14: {name: "Ace", value: 14, symbol: "A"},
  }
};

module.exports.Levels = Levels;
module.exports.CardValue = CardValue;
