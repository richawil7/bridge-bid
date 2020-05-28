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


/***** Global objects *****/
var eventIndex = 0;

/***** Initialization *****/
bidMgr.init();
tableDB.init();
tables.init();

// FIX ME  Create a single table for now
// const tblName = "tbl1";
// tableDB.createTable(tblName);


/***** State Machine Event Handlers *****/

/* Bid Processing */
function processBidCallback(err, tblName) {
  // console.log("Pushing new bid event");
  // Announce a new bid was received
  eventIndex++;
  const emitter = tables.getEmitter(tblName);
  emitter.emit('push', 'bidStream', {
    value: eventIndex
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
function sitTableCallback(err, seatObj, res) {
  if (err) {
    console.log("sitTableCallback: got error " + err);
    return;
  }
  /*
  console.log("sitTableCallback: tableName=" + seatObj.tableName);
  console.log("sitTableCallback: seat=" + seatObj.assignedSeat);
  console.log("sitTableCallback: newTable=" + seatObj.newTable);
  console.log("sitTableCallback: all player joined=" + seatObj.allPlayersJoined);
  */
  if (seatObj.newTable) {
    // New table, but still waiting for last player
    tables.addTable(seatObj.tableName);
    tables.setEmitter(seatObj.tableName, new EventEmitter());
  }
  if (seatObj.allPlayersJoined) {
    eventIndex++;
    const emitter = tables.getEmitter(seatObj.tableName);
    emitter.emit('push', 'refreshEvent', {
      value: eventIndex
    });
  }
  res.send(JSON.stringify(seatObj));
}

// Post handler to add a new player
app.post("/sit", function(req, res) {
  const tblName = req.body.tableName;
  const reqSeat = req.body.seat;
  console.log("Server received request to sit for " + reqSeat + " at " + tblName);
  tableDB.sitAtTable(tblName, reqSeat, sitTableCallback, res);
});

// ************* New Game Handling
function newGameCallback(err, tblName, res) {
  if (err) {
    console.log("newGameCallback: got error " + err);
    return;
  }
  // result is the game Number
  console.log("Pushing new game event for table " + tblName);
  const emitter = tables.getEmitter(tblName);
  // console.log(emitter);
  eventIndex++;
  emitter.emit('push', 'newGameEvent', {
    value: eventIndex
  });
  res.send('OK');
}

// Post handler for starting a new game
app.post("/:tblName/newGame", function(req, res) {
  const tblName = req.params.tblName;
  console.log("Server received new game request from table " + tblName);
  // Ask the table database to start a new game
  tableDB.newGame(tblName, false, port, newGameCallback, res);
  tables.newGame(tblName);
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
    //console.log("In server get hand for " + seat);
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


// Chat Input Handling
function chatInputCallback(err, tblName, res) {
  const emitter = tables.getEmitter(tblName);
  eventIndex++;
  emitter.emit('push', 'chatEvent', {
    value: eventIndex
  });
  res.sendStatus(200);
}
// Post handler for a chat message received from a client
app.post("/:tblName/:seat/chatInput", function(req, res) {
  const tblName = req.params.tblName;
  const seat = req.params.seat;
  console.log('Server received chat input from ' + seat + ' at table ' + tblName);
  var chatMsg = req.body.message;
  // console.log(chatMsg);
  chatMsg = seat + ': ' + chatMsg
  tableDB.addChatMsg(tblName, seat, chatMsg, chatInputCallback, res);
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

  // res.sendFile(path.resolve(__dirname + "/../public/endGame.html"));
  // Announce that this session is over
  const emitter = tables.getEmitter(tblName);
  emitter.emit('push', 'endGameEvent', {
    value: true
  });
  // Ask the table database to clean up this table
  tableDB.deleteTable(tblName);
  tables.deleteTable(tblName);
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


exports.notifyDelete = function(tblName) {
  // This function is called when a table has been deleted due to inactivity
  // We want to emit a notification to the players at that table
  const emitter = tables.getEmitter(tblName);
  emitter.emit('push', 'endGameEvent', {
    value: true
  });
}
