// jshint esversion:6
const bidMgr = require(__dirname + "/bidMgr.js");
const tableDB = require(__dirname + "/tableDB.js");
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
const emitter = new EventEmitter();
app.use(cors());

app.get('/sse', (req, res) => {
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
const tblName = "tbl1";
tableDB.createTable(tblName);


/***** State Machine Event Handlers *****/

/* Bid Processing */
function processBidCallback(err, bidCount) {
  // console.log("Pushing new bid event");
  // Announce a new bid was received
  emitter.emit('push', 'bidStream', {
    value: bidCount,
  });
}

function processBid(bidStr, bidder) {
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

// Get Dealt Hand Handling
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
app.get("/:position/hand", function(req, res) {
    const position = req.params.position;
    console.log("In server get hand for " + position);
    tableDB.getHand(tblName, position, getHandCallback, res);
});


// Get Hand Evaluation Handling
function getEvalCallback(err, handEval, res) {
  // handEval is an object
  const jsonStr = JSON.stringify(handEval);
  res.send(jsonStr);
}
// This endpoint is called by the client to get their hand evaluation
app.get("/:position/eval", function(req, res) {
    const position = req.params.position;
    console.log("In server get hand evaluation for " + position);
    tableDB.getHandEval(tblName, position, getEvalCallback, res);
});


// Get Table Status Handling
function updateCallback(err, result, res) {
  if (err) {
    console.log("updateCallback: got error " + err);
    return;
  }
  // console.log("In server update updateCallback");
  // Create an object for holding the status
  var status = {
    message: result.statusMsg,
    bidder: result.bidder,
    bidHistory: result.bidHistory,
    gameNum: result.gameNum,
    dealer: result.dealer
  };

  const jsonStr = JSON.stringify(status);
  res.send(jsonStr);
}

// This endpoint is called by the client to get game status
app.get("/update", function(req, res) {
    tableDB.getTable(tblName, updateCallback, res);
});

// New Bid Handling
// Post handler for player submitting a bid
app.post("/makeBid", function(req, res) {
  const bid = req.body.bid;
  const position = req.body.position;
  console.log("Server received bid " + bid + " from " + position);
  processBid(bid, position);
  res.sendStatus(200);
});

// New Player Handling
function takeSeatCallback(err, result, res) {
  if (err) {
    console.log("takeSeatCallback: got error " + err);
    return;
  }
  // result is an object boolean indicating if all players are sitting at the table
  // and the assigned seat
  if (result.allPlayersJoined) {
    emitter.emit('push', 'playerEvent', {
      value: 4
    });
  }
  res.send(result.assignedSeat);
}

// Post handler to add a new player
app.post("/sit", function(req, res) {
  const reqSeat = req.body.seat;
  console.log("Server received sit request from " + reqSeat);
  tableDB.joinPlayer(tblName, reqSeat, true, takeSeatCallback, res);
});


// New Game Handling
function newGameCallback(err, gameNum, res) {
  if (err) {
    console.log("newGameCallback: got error " + err);
    return;
  }
  // result is the game Number
  //console.log("Pushing new game event");
  emitter.emit('push', 'newGameEvent', {
    value: gameNum
  });
  res.send('OK');
}

// Post handler for starting a new game
app.post("/newGame", function(req, res) {
  console.log("Server received new game request");
  // Ask the table database to start a new game
  tableDB.newGame(tblName, false, port, newGameCallback, res);
});


// Rebid Handling
// Post handler for rebidding the current hand
app.post("/rebid", function(req, res) {
  console.log("Server received rebid request");
  tableDB.newGame(tblName, true, port, newGameCallback, res);
});

// Post handler for ending a session
app.post("/endGame", function(req, res) {
  console.log("Server received end game request");
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
