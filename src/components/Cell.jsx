import * as React from 'react';
import axios from 'axios';
import querystring from 'querystring';

export default function Cell({
  content,
  header,
}) {

  function bidSelected(event) {
    const bid = event.target.dataset.bid;
    console.log("User bids " + bid);
    const bidObj = {bid: bid};
    axios.post('http://192.168.1.5:3000/makeBid', querystring.stringify(bidObj));
  }

  const cellMarkup = header ? (
    <th className="Cell Cell-header">
      {content}
    </th>
  ) : (
    <td className="Cell" data-bid={content} onClick={bidSelected} >
      {content}
    </td>
  );

  return (cellMarkup);
}
