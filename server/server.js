// jshint esversion:6
const bidMgr = require(__dirname + "/bidMgr.js");
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

const bidState = {
  lastBid: '0C',
  count: 0
};

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

function announceBid(newBid) {
  const bidStr = newBid.level.toString() + newBid.suit;
  // console.log("announcing bid " + bidStr);
  bidState.lastBid = bidStr;
  bidState.count++;
  //console.log("Pushing new bid event");
  emitter.emit('push', 'bidStream', {
    value: bidState.count,
  });
}


/***** Global objects *****/
var players = [];
var gameNum = 0;
var dealer = 'North';
var bidder = 'Unknown';
var bid;
var passCount;
var bidHistory = [];
var statusMsg = "Uninitialized";

/***** Initialization *****/
bidMgr.init();

// Create players for East and West, as they are played by the Server
bidMgr.joinPlayer(players, 'East', false);
bidMgr.joinPlayer(players, 'West', false);
// FIX ME
bidMgr.joinPlayer(players, 'South', false);
// bidMgr.joinPlayer(players, 'North', true);
statusMsg = "Waiting on players to sit";

/***** State Machine Event Handlers *****/

function takeSeat(reqSeat) {
  var assignedSeat;
  var missingPlayer;
  (reqSeat == 'North') ? (missingPlayer = 'South') : (missingPlayer = 'North');
  const result = bidMgr.joinPlayer(players, reqSeat, true);
  if (result) {
    assignedSeat = reqSeat;
  } else {
    console.log("Seat for " + reqSeat + " is already taken");
    assignedSeat = missingPlayer;
    bidMgr.joinPlayer(players, missingPlayer, true);
  }

  if (bidMgr.allPlayers()) {
    statusMsg = "Waiting on new game request";
    //console.log("Pushing new player event");
    emitter.emit('push', 'playerEvent', {
      value: bidMgr.numPlayers(players)
    });
  } else {
    statusMsg = "Waiting on " + missingPlayer + " to join";
  }
  return assignedSeat;
}

function newGame() {
  // Ask the bid manager to start a new game
  bidMgr.newGame(players);

  // Clear any previous bidHistory
  bidHistory.length = 0;

  // Rotate the Dealer
  gameNum++;
  dealer = bidMgr.getNextPlayer(dealer);
  console.log("Dealer is " + dealer);
  bidder = dealer;
  bid = {suit: 'X', level: 0};
  if (dealer != 'North') {
    bidHistory.push(bid);
    if (dealer != 'East') {
      bidHistory.push(bid);
      if (dealer != 'South') {
        bidHistory.push(bid);
      }
    }
  }
  passCount = -1;
  statusMsg = "Waiting on " + bidder + " to bid";
  //console.log("Pushing new game event");
  emitter.emit('push', 'newGameEvent', {
    value: gameNum
  });
  getNextBid();
}

function processBid(nextBid) {
  announceBid(nextBid);
  // Make this next bid the current bid
  bid = nextBid;
  // Add this bid to the history
  bidHistory.push(nextBid);

  if ((nextBid.level === 0) && (nextBid.suit === 'C')) {
    passCount++;
  } else {
    passCount = 0;    // Make this next bid the current bid
  }
  if (passCount < 3) {
    bidder = bidMgr.getNextPlayer(bidder);
    getNextBid();
  } else {
    statusMsg = "This hand is over. Press new game to play again."
  }
}

function getNextBid() {
  // console.log("getNextBid: curBid is " + curBid.level + curBid.suit);
  statusMsg = "Waiting on " + bidder + " to bid";
  if (players[bidder].isHuman) {
    console.log("Human turn");
    // nextBid = players[curBidder].getBid(curBid);
    // console.log("Human bid " + nextBid.level + nextBid.suit + " for " + curBidder);
  } else {
    // Asking the computer for a bid
    nextBid = players[bidder].getBid(bid);
    console.log("Computer bid " + nextBid.level + nextBid.suit + " for " + bidder);
    processBid(nextBid);
  }
}

function processHumanBid(bidStr) {
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
  console.log("Human bid " + nextBid.level + nextBid.suit + " for " + bidder);
  processBid(nextBid);
}

function rebid() {
  // Clear any previous bidHistory
  bidHistory.length = 0;

  // Reset the bidder to be the dealer
  gameNum++;
  bidder = dealer;
  bid = {suit: 'X', level: 0};
  if (dealer != 'North') {
    bidHistory.push(bid);
    if (dealer != 'East') {
      bidHistory.push(bid);
      if (dealer != 'South') {
        bidHistory.push(bid);
      }
    }
  }
  passCount = -1;
  statusMsg = "Waiting on " + bidder + " to bid";
  //console.log("Pushing new game event");
  emitter.emit('push', 'newGameEvent', {
    value: gameNum
  });
  getNextBid();
}

/***** Endpoint handlers *****/

// This endpoint is called by the client to get their hand data
app.get("/:position/hand", function(req, res) {
    const position = req.params.position;
    console.log("In server get hand for " + position);

    // Create an object for holding the data
    var cardsInHand = [];
    if ((players[position] != undefined) && (players[position].hand != undefined)) {
      console.log("Server has valid hand for " + position);
      players[position].hand.handCards.forEach(function(card) {
        let aCard = {suit: card.suit, value: card.value};
        cardsInHand.push(aCard);
      });
    }

    const jsonStr = JSON.stringify(cardsInHand);
    res.send(jsonStr);
});

// This endpoint is called by the client to get their hand evaluation
app.get("/:position/eval", function(req, res) {
    const position = req.params.position;
    console.log("In server get hand evaluation for " + position);

    // Create an object for holding the data
    const handEvaluation = bidMgr.getHandEval(players, position);
    const jsonStr = JSON.stringify(handEvaluation);
    res.send(jsonStr);
});

// This endpoint is called by the client to get game status
app.get("/update", function(req, res) {
    // console.log("In server update handler");
    // Create an object for holding the status
    var status = {
      message: statusMsg,
      bidder: bidder,
      bidHistory: bidHistory,
      gameNum: gameNum,
      dealer: dealer
    };

    const jsonStr = JSON.stringify(status);
    res.send(jsonStr);
});

// Post handler for player submitting a bid
app.post("/makeBid", function(req, res) {
  const bid = req.body.bid;
  console.log("Server received bid " + bid);
  processHumanBid(bid);
  res.sendStatus(200);
});

// Post handler to add a new player
app.post("/sit", function(req, res) {
  const reqSeat = req.body.seat;
  console.log("Server received sit request from " + reqSeat);
  const assignedSeat = takeSeat(reqSeat);
  res.send(assignedSeat);
});

// Post handler for starting a new game
app.post("/newGame", function(req, res) {
  console.log("Server received new game request");
  newGame();
  res.send('OK');
});

// Post handler for rebidding the current hand
app.post("/rebid", function(req, res) {
  console.log("Server received rebid request");
  rebid();
  res.send('OK');
});


// Home page
app.use('/', function(req, res) {
  res.sendFile(path.resolve(__dirname + "/../dist/index.html"));
});

// Set up a port for the server to listen on
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000; // localhost:3000
};

// Start the server
app.listen(port, function() {
  console.log("Server started on port " + port);
});
