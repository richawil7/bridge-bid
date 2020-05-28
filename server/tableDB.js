/* This module represents a bridge table and stores it in a MongoDB database.
 * In the database, we keep table state and characteristics.
 * But for dynamically created objects associated with a table, these are kept
 * in a tables array in server memory by the file tables.js.
 */

// Require the dynamic tables module
const tables = require(__dirname + "/tables.js");

// Require the bidMgr handModule
const bidMgr = require(__dirname + "/bidMgr.js");

// Require the player module
const playerModule = require(__dirname + "/player.js");

const axios = require('axios');
const querystring = require('querystring');

// Create and establish database using Mongoose
const mongoose = require('mongoose');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = '/bridgeTableDB';

const cardSchema = new mongoose.Schema({
  suit: String,
  value: String
});

const bidSchema = new mongoose.Schema({
  level: Number,
  suit: String
});

const handSchema = new mongoose.Schema({
  handCards: [cardSchema],
  distribution: [Number],
  hcPts: Number,
  distPts: Number,
  totalPts: Number,
  openingBid: bidSchema,
  player: String
});

const playerSchema = new mongoose.Schema({
  position: String,
  isHuman: Boolean,
  hand: handSchema
});

// Define a schema for a bridge table
const tableSchema = new mongoose.Schema({
  name: String,
  players: [playerSchema],
  allPlayersJoined: Boolean,
  dealer: String,
  bidder: String,
  bid: bidSchema,
  passCount: Number,
  bidHistory: [bidSchema],
  statusMsg: String,
  chats: [String],
  epoch: Number
});

// Create a model for a table from the schema.
const TableModel = mongoose.model("TableItem", tableSchema);

exports.init = function() {
  // Connect to the mongoDB server and create/attach to the database
  mongoose.connect("mongodb://localhost:27017" + dbName, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}


/***** Helper Functions *****/

function getNextBid(table, port) {
  table.statusMsg = "Waiting on " + table.bidder + " to bid";
  // Find the player who is supposed to bid next
  var index = -1;
  for (let i=0; i<4; i++) {
    if (table.bidder === table.players[i].position) {
      index = i;
      break;
    }
  }
  if (table.players[index].isHuman) {
    // console.log("Human turn");
  } else {
    // Asking the computer for a bid
    nextBid = playerModule.getBid(table.players[index], table.bid);
    // console.log("Computer bid " + nextBid.level + nextBid.suit + " for " + table.bidder);
    const bidStr = nextBid.level.toString() + nextBid.suit;
    const bidObj = {bid: bidStr};
    const url = 'http://localhost:' + port.toString() + '/' + table.name + '/' + table.bidder + '/makeBid';
    axios.post(url, querystring.stringify(bidObj))
    .then(function (response) {
        // console.log("getNextBid: axios makeBid post result: " + response);
    })
    .catch(function (error) {
        console.log("getNextBid: error in axios: " + error);
    });
    // processBid(0, table, nextBid);
  }
}

/***** Database Operations *****/
function createTable(tableName) {
  var newPlayer = playerModule.Player("East", false);
  const east = {
        objectId: newPlayer,
        position: 'East',
        isHuman: false,
        hand: {handCards: [],
               hcPts: 0,
               totalPts: 0,
               openingBid: {level: 0, suit: 'C'},
               player: 'East'}
  };
  newPlayer = playerModule.Player("West", false);
  const west = {
        objectId: newPlayer,
        position: 'West',
        isHuman: false,
        hand: {handCards: [],
               hcPts: 0,
               totalPts: 0,
               openingBid: {level: 0, suit: 'C'},
               player: 'West'}
  };
  // FIX ME
  newPlayer = playerModule.Player("South", false);
  const south = {
        objectId: newPlayer,
        position: 'South',
        isHuman: false,
        hand: {handCards: [],
               hcPts: 0,
               totalPts: 0,
               openingBid: {level: 0, suit: 'C'},
               player: 'South'}
  };
  const table = new TableModel({
    name: tableName,
    players: [east, west, south],
    allPlayersJoined: false,
    dealer: 'North',
    bidder: 'North',
    bid: {level: 0, suit: 'C'},
    passCount: 0,
    bidHistory: [],
    chats: [],
    statusMsg: 'Table created. Waiting for players to sit',
    epoch: 0
  });
  return table;
}

function addPlayerToTable(table, newTable, seat, callback, res) {
  const newPlayerObj = playerModule.Player(seat, true);
  const newPlayer = {
    objectId: newPlayerObj,
    position: seat,
    isHuman: true,
    hand: {handCards: [],
           hcPts: 0,
           totalPts: 0,
           openingBid: {level: 0, suit: 'C'},
           player: seat}
  };
  table.players.push(newPlayer);

  // Check how many players we have at the table
  const playerCount = table.players.length;
  console.log("You have " + playerCount + " players");
  if (playerCount == 4) {
    console.log("All players have joined");
    table.allPlayersJoined = true;
    table.statusMsg = "Waiting on new game request";
  } else {
    const missingPlayer = (seat === "North") ? 'South' : 'North';
    table.statusMsg = "Waiting on " + missingPlayer + " to join";
  }

  const promise = table.save();
  promise
  .then(function(result) {
    // Return the assigned seat to the caller
    const seatObj = {
      tableName: table.name,
      assignedSeat: seat,
      allPlayersJoined: table.allPlayersJoined,
      newTable: newTable
    };
    callback(null, seatObj, res);
  })
  .catch(function(err) {
    console.log("addPlayerToTable save: got error " + err);
    callback(internalProcessBid, null, res);
  });
}

exports.sitAtTable = function(tableName, reqSeat, callback, res) {
  // Check if this table already exists
  TableModel.findOne({name: tableName}, function(err, table) {
    if (err) {
      console.log("sitAtTable findOne: got error " + err);
      return;
    }
    var assignedSeat = reqSeat;
    var newTable;
    if (table) {
      // Found an existing table
      newTable = false;
      // Check how many players are already seated
      if (table.players.length === 4) {
        // Table is full. Reject the request.
        callback("Table exists and is full", null, res);
        return;
      } else if (table.players.length === 3) {
        // We have an available seat
        for (let i=0; i<3; i++) {
          if (table.players[i].position === 'North') {
            assignedSeat = 'South';
            break;
          } else if (table.players[i].position === 'South') {
            assignedSeat = 'North';
            break;
          }
        }
      }
    } else {
      // Table does not exist. Let's create it.
      newTable = true;
      table = createTable(tableName);
    }

    // console.log('sitAtTable: name=' + table.name);
    // const tblStr = (newTable) ? 'This is a new table' : 'This is an existing table';
    // console.log(tblStr);
    // Add the new player to the table
    addPlayerToTable(table, newTable, assignedSeat, callback, res);
  });
}

exports.getTable = function(tableName, callback, res) {
  // Get table information from the database
  TableModel.findOne({name: tableName}, function(err, table) {
    if (err) {
      console.log("getTable findOne: got error " + err);
      return;
    }
    const tableStatus = {
      message: table.statusMsg,
      bidder: table.bidder,
      bidHistory: table.bidHistory,
      dealer: table.dealer,
      chats: table.chats,
      epoch: table.epoch
    };
    callback(err, tableStatus, res);
  });
}


exports.newGame = function(tableName, rebid, port, callback, res) {
  // rebid parameter is a boolean. If true, means we want to rebid the existing hand
  // Get the table from the database
  TableModel.findOne({name: tableName}, function(err, table) {
      if (err) {
        console.log("newGame findOne: got error " + err);
        callback(err, 0, res);
        return;
      }
      if (!rebid) {
        table.dealer = playerModule.getNextPlayer(table.dealer);
      }
      bid = {suit: 'X', level: 0};
      var newHistory = [];
      if (table.dealer != 'North') {
        newHistory.push(bid);
        if (table.dealer != 'East') {
          newHistory.push(bid);
          if (table.dealer != 'South') {
            newHistory.push(bid);
          }
        }
      }
      TableModel.updateOne({name: tableName}, { $set: {bidHistory: newHistory }},  {multi:true},
        function(err, affected) {
          if (err) {
            console.log("newGame updateOne: clear history got error " + err);
            callback(err, null);
            return;
          }
          console.log('Cleared bidHistory. result: ', affected);
        }
      );
      table.bidder = table.dealer;
      table.passCount = -1;
      table.statusMsg = "Waiting on " + table.bidder + " to bid";
      table.epoch++;

      // Ask the bid manager to deal the cards
      if (!rebid) {
        bidMgr.dealCards(table.players);
      }
      const promise = table.save();
      promise
      .then(function(result) {
        callback(err, tableName, res);
        getNextBid(table, port);
      })
      .catch(function(err) {
        console.log("newGame got error " + err);
        callback(err, null);
      });
    });
}

exports.getHand = function(tableName, position, callback, res) {
  // Get the table from the database
  TableModel.findOne({name: tableName}, function(err, table) {
    if (err) {
      console.log("getHand findOne: got error " + err);
      callback(err, null, res);
      return;
    }
    // Find the selected player
    for (let i=0; i<4; i++) {
      if (table.players[i].position == position) {
        // Create an object for holding the data
        var cardsInHand = [];
        if ((table.players[i].hand != undefined) &&
            (table.players[i].hand.handCards.length == 13)) {
          // console.log("Server has valid hand for " + position);
          table.players[i].hand.handCards.forEach(function(card) {
            let aCard = {suit: card.suit, value: card.value};
            cardsInHand.push(aCard);
          });
        }
        callback(null, cardsInHand, res);
        return;
      }
    }
    const err2 = "Did not find hand for " + position + " at table " + tableName;
    callback(err2, null, res);
  });
}

exports.getHandEval = function(tableName, position, callback, res) {
  // Get the table from the database
  TableModel.findOne({name: tableName}, function(err, table) {
    if (err) {
      console.log("getHand findOne: got error " + err);
      callback(err, null, res);
      return;
    }
    // Ask the bid manager
    // Create an object for holding the data
    const handEvaluation = bidMgr.getHandEval(table.players, position);
    callback(null, handEvaluation, res);
  });
}


function processBid(tableName, table, nextBid, port, callback, bidder) {
  function internalProcessBid(table, nextBid, bidder) {
    // Did we get the expected bidder
    if (table.bidder !== bidder) {
      console.log("tableDB processBid: expected bidder " + table.bidder + ", got " + bidder);
      return;
    }
    table.bid = nextBid;
    table.bidHistory.push(nextBid);
    table.epoch++;
    if ((nextBid.level === 0) && (nextBid.suit === 'C')) {
      table.passCount++;
    } else {
      table.passCount = 0;
    }
    if (table.passCount < 3) {
      table.bidder = playerModule.getNextPlayer(table.bidder);
      table.statusMsg = "Waiting on " + table.bidder + " to bid."
    } else {
      table.statusMsg = "This hand is over. Press new game to play again, or end game to quit."
    }
    const promise = table.save();
    promise
    .then(function(result) {
      callback(null, tableName);
      if (table.passCount < 3) {
        getNextBid(table, port);
      }
    })
    .catch(function(err) {
      console.log("processBid save: got error " + err);
      callback(err, null);
    });
  }

  if (table == null) {
    // Get the table from the database
    TableModel.findOne({name: tableName}, function(err, table) {
        if (err) {
          console.log("processBid findOne: got error " + err);
          callback(err, 0, res);
          return;
        }
        internalProcessBid(table, nextBid, bidder);
      });
  } else {
    internalProcessBid(table, nextBid, bidder);
  }
}


exports.addChatMsg = function(tableName, seat, message, callback, res) {
  // Get the table from the database
  TableModel.findOne({name: tableName}, function(err, table) {
    if (err) {
      console.log("addChatMsg findOne: got error " + err);
      callback(err, tableName, res);
      return;
    }
    if (table.chats.length >= 5) {
      // Maintain a limit on the number of stored chat messages
      table.chats.shift();
    }
    table.chats.push(message);
    table.epoch++;

    const promise = table.save();
    promise
    .then(function(result) {
      callback(null, tableName, res);
    })
    .catch(function(err) {
      console.log("addChatMsg save: got error " + err);
      callback(err, tableName, res);
    });
  })
}


exports.deleteTable= function(tableName) {
  // rebid parameter is a boolean. If true, means we want to rebid the existing hand
  // Delete the table from the database
  TableModel.deleteOne({name: tableName}, function(err, result) {
      if (err) {
        console.log("deleteTable deleteOne: got error " + err);
        return;
      }
      console.log("tableDB deleteTable: closed table " + tableName + " result: " + result);
    }
  )
}

exports.processBid = processBid;
