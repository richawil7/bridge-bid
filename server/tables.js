 // This file maintains a list of active tables in memory.
 // It is intended to hold dynamic data associated with a table.
 // Otherwise, per-table data is maintained in a database by tableDB.js
const tableDB = require(__dirname + "/tableDB.js");
const server = require(__dirname + "/server.js");

const maxAge = 20 * 60 * 1000;    // twenty minutes
const pollInterval = 5 * 1000;    // five seconds

// Global table array
var tables;
var index;

function init() {
  tables = [];
  index = 0;
  pruneDeadTable();
}

function addTable(tableName) {
  const newTable = {
    name: tableName,
    timestamp: new Date(),
    emitter: null
  }
  tables.push(newTable);
}

function newGame(tableName) {
  // We want to update the timestamp on the table when a new game is started
  for (let i=0; i<tables.length; i++) {
    if (tables[i].name === tableName) {
      tables[i].timestamp = new Date();
      return;
    }
  }
}

function setEmitter(tableName, emitter) {
  for (let i=0; i<tables.length; i++) {
    if (tables[i].name === tableName) {
      tables[i].emitter = emitter;
      return;
    }
  }
}

function getEmitter(tableName) {
  for (let i=0; i<tables.length; i++) {
    if (tables[i].name === tableName) {
      return (tables[i].emitter);
    }
  }
}


function deleteTable(tableName) {
  for (let i=0; i<tables.length; i++) {
    if (tables[i].name =ne== tableName) {
      tables.splice(i, 1);
      return;
    }
  }
  console.log("deleteTable: table " + tableName + " not found");
}

function pruneDeadTable() {
  // This function runs periodically, examining one table in each invocation
  // If the table timestamp is old, the table is deleted.

  // Get the current table length
  const numTables = tables.length;
  var tableName;

  if (numTables > 0) {
    // Find the next table to examine
    index++;
    if (index >= numTables) {
      index = 0;
    }
    //console.log("pruneDeadTable: examining index " + index);
    // We are examining the table at index
    // Calculate its age in milliseconds
    const now = new Date();
    const age = now - tables[index].timestamp;
    if (age > maxAge) {
      tableName = tables[index].name;
      // Ask the table database to also delete this table
      tableDB.deleteTable(tableName);
      // Ask the server to send a notification the table is gone
      server.notifyDelete(tableName);
      // Declare this table inactive and delete it
      tables.splice(index, 1);
      console.log("pruneDeadTable: removed table " + tableName + " at index " + index);
      // Decrement the index so that the next table will be processed
      index--;
    }
  }
  // Schedule this function to be called again
  setTimeout(pruneDeadTable, pollInterval);
}


exports.init = init;
exports.addTable = addTable;
exports.newGame = newGame;
exports.setEmitter = setEmitter;
exports.getEmitter = getEmitter;
exports.deleteTable = deleteTable;
