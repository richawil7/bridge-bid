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
bidMgr.joinPlayer(players, 'North', true);
statusMsg = "Waiting on players to sit";

/***** State Machine Event Handlers *****/

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
    announceBid(nextBid);

    // Make this next bid the current bid
    bid = nextBid;
    // Add this bid to the history
    bidHistory.push(nextBid);

    if (nextBid.level === 0) {
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
}

function processHumanBid(bidStr) {
  const level = Number(bidStr.charAt(0));
  const suit = bidStr.charAt(1);
  if (suit === 'N') {
    suit = "NT";
  }
  nextBid = {suit: suit, level: level};
  console.log("Human bid " + nextBid.level + nextBid.suit + " for " + bidder);
  announceBid(nextBid);

  // Make this next bid the current bid
  bid = nextBid;
  // Add this bid to the history
  bidHistory.push(bid);

  if (nextBid.level === 0) {
    passCount++;
  } else {
    passCount = 0;
  }
  if (passCount < 3) {
    bidder = bidMgr.getNextPlayer(bidder);
    getNextBid();
  } else {
    statusMsg = "This hand is over. Press new game to play again."
  }
}

// This endpoint is called by the client to get their hand data
app.get("/:position/hand", function(req, res) {
    const position = req.params.position;
    // const position = 'North';
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
  const seat = req.body.seat;
  console.log("Server received sit request from " + seat);
  bidMgr.joinPlayer(players, seat, true);
  var missingPlayer;

  (seat == 'North') ? (missingPlayer = 'South') : (missingPlayer = 'North');
  if (bidMgr.allPlayers()) {
    statusMsg = "Waiting on new game request";
    //console.log("Pushing new player event");
    emitter.emit('push', 'playerEvent', {
      value: bidMgr.numPlayers(players)
    });
  } else {
    statusMsg = "Waiting on " + missingPlayer + " to join";
  }
  res.send('OK');
});

// Post handler for starting a new game
app.post("/newGame", function(req, res) {
  console.log("Server received new game request");
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
  passCount = 0;
  statusMsg = "Waiting on " + bidder + " to bid";
  //console.log("Pushing new game event");
  emitter.emit('push', 'newGameEvent', {
    value: gameNum
  });
  getNextBid();
  res.send('OK');
});

// Home page
app.use('/', function(req, res) {
  res.sendFile(path.resolve(__dirname + "/../dist/index.html"));
});


// Start the server, listening on port 3000
// This server can be reached at URL localhost:3000
app.listen(3000, function() {
    console.log("Server started on port 3000");
});
