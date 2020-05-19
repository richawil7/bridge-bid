import React from "react";
//import BidItem from "./BidItem.jsx";
import DataTable from "./DataTable.jsx"

function BidGrid(props) {

  //const headings = ['Club', 'Diamond', 'Heart', 'Spade', 'No Trump'];
  const headings = [];

  var bids = [['1C', '1D', '1H', '1S', '1NT'],
              ['2C', '2D', '2H', '2S', '2NT'],
              ['3C', '3D', '3H', '3S', '3NT'],
              ['4C', '4D', '4H', '4S', '4NT'],
              ['5C', '5D', '5H', '5S', '5NT'],
              ['6C', '6D', '6H', '6S', '6NT'],
              ['7C', '7D', '7H', '7S', '7NT'],
              ['Pass', '', '', '', 'Double']
             ];

  return (
    <div className='bidEntry' >
      {(props.state.bidder === props.position) ?
        ( <div>
            <h3>Enter A Bid</h3>
            <DataTable headings={headings} rows={bids} />
          </div>
        ) : (null)
      }
    </div>
  );
}

export default BidGrid;
