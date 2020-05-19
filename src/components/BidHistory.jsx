import React, {useEffect} from "react";
import { useSSE } from 'react-hooks-sse';
import DataTable from "./DataTable.jsx"
import getStatus from "./GetStatus.jsx"

const headings = ['North', 'East', 'South', 'West'];

function BidHistory(props) {
  const state = props.state;
  const lastBid = useSSE('bidStream', {
    value: 0,
  });
  var rows = [[]];

  var rowIndex = 0;
  var columnIndex = 0;
  state.bidHistory.forEach(function (bid) {
    // console.log("Bid hist: " + bid.level + bid.suit);
    var bidStr;
    if (bid.level == 0) {
      bidStr = 'Pass';
    } else {
      bidStr = bid.level + bid.suit;
    }
    rows[rowIndex].push(bidStr);
    columnIndex++;
    if (columnIndex == 4) {
      rows.push([]);
      rowIndex++;
      columnIndex = 0;
    }
  });

  useEffect(() => {
    console.log("In BidHistory useEffect update");
    getStatus(props.state, props.setFx);
  }, [lastBid.value]);

  useEffect(() => {
    console.log("In BidHistory useEffect rerender");
  }, [state.delta]);

  // const rows = [['X', '0C', '1C', '1D'], ['1S', '1N']];
  // console.log("Rows: " + rows);

  return (
    <div className='bidHistory'>
      <h3>Bid History</h3>
      <DataTable headings={headings} rows={rows} />
    </div>
  )
}

export default BidHistory;
