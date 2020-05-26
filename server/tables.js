
var tables = [];

function addTable(tableName) {
  const newTable = {
    name: tableName,
    playerCount: 0,
    emitter: null
  }
  tables.push(newTable);
}

function doesTableExist(tableName) {
  for (let i=0; i<tables.length; i++) {
    if (tables[i].name === tableName) {
      return true;
    }
  }
  return false;
}

function addPlayerToTable(tableName, numPlayers) {
  for (let i=0; i<tables.length; i++) {
    if (tables[i].name === tableName) {
      tables[i].playerCount += numPlayers;
      return;
    }
  }
  console.log("addPlayerToTable: table " + tableName + " not found");
}

function isTableFull(tableName) {
  for (let i=0; i<tables.length; i++) {
    if (tables[i].name === tableName) {
      if (tables[i].playerCount === 4) {
        return true;
      } else {
        return false;
      }
    }
  }
  console.log("isTableFull: table " + tableName + " not found");
  return false;
}

function removeTable(tableName) {
  for (let i=0; i<tables.length; i++) {
    if (tables[i].name === tableName) {
      tables.splice(i, 1);
      return;
    }
  }
  console.log("removeTable: table " + tableName + " not found");
}

exports.sitAtTable = function(tableName) {
  // Check if this table name is available
  if (doesTableExist(tableName)) {
    // Check if the table is already full
    if (isTableFull(tableName)) {
      // Sorry, can't sit at a full table
      return ({err: "Table is full", newTable: null});
    } else {
      addPlayerToTable(tableName, 1);
      return ({err: null, newTable: false});
    }
  } else {
    // Create a new table with this Name
    addTable(tableName);
    addPlayerToTable(tableName, 1);
    return ({err: null, newTable: true});
  }
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
