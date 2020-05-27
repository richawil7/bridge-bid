 // This file maintains a list of active tables in memory.
 // It is intended to hold dynamic data associated with a table.
 // Otherwise, per-table data is maintained in a database by tableDB.js

var tables = [];

exports.addTable = function(tableName) {
  const newTable = {
    name: tableName,
    emitter: null
  }
  tables.push(newTable);
}

exports.removeTable = function(tableName) {
  for (let i=0; i<tables.length; i++) {
    if (tables[i].name === tableName) {
      tables.splice(i, 1);
      return;
    }
  }
  console.log("removeTable: table " + tableName + " not found");
}

exports.setEmitter = function(tableName, emitter) {
  for (let i=0; i<tables.length; i++) {
    if (tables[i].name === tableName) {
      tables[i].emitter = emitter;
      return;
    }
  }
}

exports.getEmitter = function(tableName) {
  for (let i=0; i<tables.length; i++) {
    if (tables[i].name === tableName) {
      return (tables[i].emitter);
    }
  }
}
