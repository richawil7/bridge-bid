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
  index: Number,
  players: [playerSchema],
  gameNum: Number,
  dealer: String,
  bidder: String,
  bid: bidSchema,
  passCount: Number,
  bidHistory: [bidSchema],
  statusMsg: String
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

function getNextBid(table) {
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
    const bidStr = Number(nextBid.level) + nextBid.suit;
    const bidObj = {bid: bidStr, position: table.bidder};
    // FIX ME
    const url = 'http://localhost:3000/makeBid';
    axios.post(url, querystring.stringify(bidObj));
    // processBid(0, table, nextBid);
  }
}

/***** Database Operations *****/

exports.createTable = function(tableIndex) {
  // See if this table already exists
  TableModel.findOne({
    index: tableIndex
  }, function(err, table) {
    if (err) {
      console.log("createTable find: got error " + err);
      return;
    }
    if (table != null) {
      console.log("createTable: table already exists ");
    } else {
      console.log("createTable: table not found. Creating it");
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
        index: tableIndex,
        players: [east, west, south],
        allPlayersJoined: false,
        gameNum: 0,
        dealer: 'North',
        bidder: 'North',
        bid: {level: 0, suit: 'C'},
        passCount: 0,
        bidHistory: [],
        statusMsg: 'Table created. Waiting for players to sit'
      });
      // console.log(table);
      table.save();
    }
  });
}

exports.getTable = function(tableId, callback, res) {
  // Get the table from the database
  TableModel.findOne({
    index: tableId
  }, function(err, table) {
    if (err) {
      console.log("getTable findOne: got error " + err);
      return;
    }
    callback(err, table, res);
  });
}


exports.joinPlayer = function(tableId, reqSeat, isHuman, callback, res) {
  var assignedSeat = null;
  var missingPlayer;
  (reqSeat == 'North') ? (missingPlayer = 'South') : (missingPlayer = 'North');

  // Get the table from the database
  TableModel.findOne({
    index: tableId
  }, function(err, table) {
    if (err) {
      console.log("joinPlayer findOne: got error " + err);
      callback(err, null);
      return;
    }
    console.log("joinPlayer: found table " + table);
    // Check if this player already exists
    var index = -1;
    for (let i=0; i<table.players.length; i++) {
      if (table.players[i].position === reqSeat) {
        console.log("Already have a player sitting at " + reqSeat);
        assignedSeat = missingPlayer;
        break;
      }
    }
    if (!assignedSeat) {
      assignedSeat = reqSeat;
    }
    var newPlayer = playerModule.Player(assignedSeat, isHuman);
    const player = {
      objectId: newPlayer,
      position: assignedSeat,
      isHuman: isHuman,
      hand: {handCards: [],
             hcPts: 0,
             totalPts: 0,
             openingBid: {level: 0, suit: 'C'},
             player: assignedSeat}
    };
    table.players.push(player);

    // Check how many players we have at the table
    const playerCount = table.players.length;
    console.log("You have " + playerCount + " players");
    if (playerCount == 4) {
      console.log("All players have joined");
      table.allPlayersJoined = true;
      table.statusMsg = "Waiting on new game request";
    } else {
      table.statusMsg = "Waiting on " + missingPlayer + " to join";
    }

    const promise = table.save();
    promise
    .then(function(result) {
      // Return the assigned seat to the caller
      const seatObj = {
        assignedSeat: assignedSeat,
        allPlayersJoined: table.allPlayersJoined
      };
      callback(null, seatObj, res);
    })
    .catch(function(err) {
      console.log("joinPlayer save: got error " + err);
      callback(err, null, res);
    });
  });
}

exports.newGame = function(tableId, rebid, callback, res) {
  // rebid parameter is a boolean. If true, means we want to rebid the existing hand
  // Get the table from the database
  TableModel.findOne({index: tableId}, function(err, table) {
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
      TableModel.updateOne({index: tableId}, { $set: {bidHistory: newHistory }},  {multi:true},
        function(err, affected) {
          console.log('Clear bidHistory result: ', affected);
        }
      );
      table.gameNum++;
      table.bidder = table.dealer;
      table.passCount = -1;
      table.statusMsg = "Waiting on " + table.bidder + " to bid";

      // Ask the bid manager to deal the cards
      if (!rebid) {
        bidMgr.dealCards(table.players);
      }
      const promise = table.save();
      promise
      .then(function(result) {
        callback(err, table.gameNum, res);
        getNextBid(table);
      })
      .catch(function(err) {
        console.log("newGame got error " + err);
        callback(err, null);
      });
    });
}

exports.getHand = function(tableId, position, callback, res) {
  // Get the table from the database
  TableModel.findOne({
    index: tableId
  }, function(err, table) {
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
          console.log("Server has valid hand for " + position);
          table.players[i].hand.handCards.forEach(function(card) {
            let aCard = {suit: card.suit, value: card.value};
            cardsInHand.push(aCard);
          });
        }
        callback(null, cardsInHand, res);
        return;
      }
    }
    const err2 = "Did not find hand for " + position + " at table " + tableId;
    callback(err2, null, res);
  });
}

exports.getHandEval = function(tableId, position, callback, res) {
  // Get the table from the database
  TableModel.findOne({
    index: tableId
  }, function(err, table) {
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


function processBid(tableId, table, nextBid, callback) {
  function internalProcessBid(table, nextBid) {
    table.bid = nextBid;
    table.bidHistory.push(nextBid);
    if ((nextBid.level === 0) && (nextBid.suit === 'C')) {
      table.passCount++;
    } else {
      table.passCount = 0;
    }
    if (table.passCount < 3) {
      table.bidder = playerModule.getNextPlayer(table.bidder);
      table.statusMsg = "Waiting on " + table.bidder + " to bid."
    } else {
      table.statusMsg = "This hand is over. Press new game to play again."
    }
    const promise = table.save();
    promise
    .then(function(result) {
      callback(null, nextBid);
      if (table.passCount < 3) {
        getNextBid(table);
      }
    })
    .catch(function(err) {
      console.log("processBid save: got error " + err);
      callback(err, null);
    });
  }

  if (table == null) {
    // Get the table from the database
    TableModel.findOne({
        index: tableId
      }, function(err, table) {
        if (err) {
          console.log("processBid findOne: got error " + err);
          callback(err, 0, res);
          return;
        }
        internalProcessBid(table, nextBid);
      });
  } else {
    internalProcessBid(table, nextBid);
  }
}

exports.processBid = processBid;
