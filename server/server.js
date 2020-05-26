// jshint esversion:6
const bidMgr = require(__dirname + "/bidMgr.js");
const tableDB = require(__dirname + "/tableDB.js");
const tables = require(__dirname + "/tables.js");
const path = require('path');
const express = require("express", "4.17.1");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("dist"));
app.use(express.static("public"));

// These are for supporting server side event notifications
const EventEmitter = require('events');
const uuid = require('uuid');
const cors = require('cors');
app.use(cors());

app.get('/:tblName/sse', (req, res) => {
  const tblName = req.params.tblName;
  const emitter = tables.getEmitter(tblName);
  if (!emitter) {
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const listener = (event, data) => {
    res.write(`id: ${uuid.v4()}\n`);
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  emitter.addListener('push', listener);

  req.on('close', () => {
    emitter.removeListener('push', listener);
  });
});


/***** Global objects *****
var players = [];
var gameNum = 0;
var dealer = 'North';
var bidder = 'Unknown';
var bid;
var passCount;
var bidHistory = [];
var statusMsg = "Uninitialized";
*/

/***** Initialization *****/
bidMgr.init();
tableDB.init();

// FIX ME  Create a single table for now
// const tblName = "tbl1";
// tableDB.createTable(tblName);


/***** State Machine Event Handlers *****/

/* Bid Processing */
function processBidCallback(err, tblName, bidCount) {
  // console.log("Pushing new bid event");
  // Announce a new bid was received
  const emitter = tables.getEmitter(tblName);
  emitter.emit('push', 'bidStream', {
    value: bidCount,
  });
}

function processBid(bidStr, tblName, bidder) {
  var level;
  var suit;
  const levelChar = bidStr.charAt(0);
  if (levelChar === 'P') {
    // This is a pass bidStr
    level = 0;
    suit = 'C';
  } else if (levelChar === 'D') {
    // Bid was a double
    level = 0;
    suit = 'S';
  } else {
    level = Number(levelChar);
    suit = bidStr.charAt(1);
    if (suit === 'N') {
      suit = "NT";
    }
  }
  nextBid = {suit: suit, level: level};

  //console.log("Human bid " + nextBid.level + nextBid.suit + " for " + bidder);
  tableDB.processBid(tblName, null, nextBid, port, processBidCallback, bidder);
}

/***** Endpoint handlers *****/

// ************* Create Table and Join Player Handling
// New Player Handling
function takeSeatCallback(err, result, res) {
  if (err) {
    console.log("takeSeatCallback: got error " + err);
    return;
  }
  // result is an object boolean indicating if all players are sitting at the table
  // and the assigned seat
  if (result.allPlayersJoined) {
    const emitter = tables.getEmitter(result.tableName);
    emitter.emit('push', 'playerEvent', {
      value: 4
    });
  }
  //console.log('takeSeatCallback: table=' + result.tableName);
  //console.log('takeSeatCallback: seat=' + result.assignedSeat);
  res.send(JSON.stringify(result));
}

function createTableCallback(err, tblName, reqSeat, res) {
  if (err) {
    console.log("createTableCallback: got error " + err);
    return;
  }
  tableDB.joinPlayer(tblName, reqSeat, true, takeSeatCallback, res);
}
// Post handler to add a new player
app.post("/sit", function(req, res) {
  const tblName = req.body.tableName;
  const reqSeat = req.body.seat;
  console.log("Server received request to sit for " + reqSeat + " at " + tblName);
  const result = tables.sitAtTable(tblName);
  if (result.err) {
    console.log("Failed to find seat at table " + tblName);
  } else {
    if (result.newTable) {
      // Need to create a new table
      emitter = new EventEmitter();
      tables.setEmitter(tblName, emitter);
      tableDB.createTable(tblName, createTableCallback, reqSeat, res);
    } else {
      tableDB.joinPlayer(tblName, reqSeat, true, takeSeatCallback, res);
    }
  }
});

// ************* New Game Handling
function newGameCallback(err, tblName, gameNum, res) {
  if (err) {
    console.log("newGameCallback: got error " + err);
    return;
  }
  // result is the game Number
  console.log("Pushing new game event for table " + tblName);
  const emitter = tables.getEmitter(tblName);
  console.log(emitter);
  emitter.emit('push', 'newGameEvent', {
    value: gameNum
  });
  res.send('OK');
}

// Post handler for starting a new game
app.post("/:tblName/newGame", function(req, res) {
  const tblName = req.params.tblName;
  console.log("Server received new game request from table " + tblName);
  // Ask the table database to start a new game
  tableDB.newGame(tblName, false, port, newGameCallback, res);
});


// ************** Get Dealt Hand Handling
function getHandCallback(err, cards, res) {
  // cards is an array of card objects
  var jsonStr;
  if (err) {
    console.log("getHandCallback error: " + err);
    jsonStr = JSON.stringify([]);
  } else {
    jsonStr = JSON.stringify(cards);
  }
  res.send(jsonStr);
}
// This endpoint is called by the client to get their hand data
app.get("/:tblName/:seat/hand", function(req, res) {
    const tblName = req.params.tblName;
    const seat = req.params.seat;
    console.log("In server get hand for " + seat);
    tableDB.getHand(tblName, seat, getHandCallback, res);
});


// ************** Get Table Status Handling
function updateCallback(err, status, res) {
  if (err) {
    console.log("updateCallback: got error " + err);
    return;
  }
  // console.log("In server update updateCallback");
  const jsonStr = JSON.stringify(status);
  res.send(jsonStr);
}

// This endpoint is called by the client to get game status
app.get("/:tblName/update", function(req, res) {
    const tblName = req.params.tblName;
    // console.log('Server got update request for table ' + tblName);
    tableDB.getTable(tblName, updateCallback, res);
});


// ************** New Bid Handling
// Post handler for player submitting a bid
app.post("/:tblName/:seat/makeBid", function(req, res) {
  const tblName = req.params.tblName;
  const seat = req.params.seat;
  const bid = req.body.bid;
  // console.log("Server received bid " + bid + " from " + seat);
  processBid(bid, tblName, seat);
  res.sendStatus(200);
});



// *************** Get Hand Evaluation Handling
function getEvalCallback(err, handEval, res) {
  // handEval is an object
  const jsonStr = JSON.stringify(handEval);
  res.send(jsonStr);
}
// This endpoint is called by the client to get their hand evaluation
app.get("/:tblName/:seat/eval", function(req, res) {
    const tblName = req.params.tblName;
    const seat = req.params.seat;
    console.log("In server get hand evaluation for " + tblName + ' at seat '+ seat);
    tableDB.getHandEval(tblName, seat, getEvalCallback, res);
});


// Rebid Handling
// Post handler for rebidding the current hand
app.post("/:tblName/rebid", function(req, res) {
  const tblName = req.params.tblName;
  console.log("Server received rebid request from table " + tblName);
  tableDB.newGame(tblName, true, port, newGameCallback, res);
});

// Post handler for ending a session
app.post("/:tblName/endGame", function(req, res) {
  const tblName = req.params.tblName;
  console.log("Server received end game request from table " + tblName);
  // Ask the table database to clean up this table
  tableDB.endGame(tblName);
  res.sendFile(path.resolve(__dirname + "/../public/endGame.html"));
});

// Home page
app.use('/', function(req, res) {
  res.sendFile(path.resolve(__dirname + "/../dist/index.html"));
});

// Set up a port for the server to listen on
var port = process.env.PORT;
if (port == null || port == "") {
  port = 3000; // localhost:3000
};

// Start the server
app.listen(port, function() {
  console.log("Server started on port " + port);
});
