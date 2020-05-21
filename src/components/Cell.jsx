import * as React from 'react';
import axios from 'axios';
import querystring from 'querystring';
import serverUrl from "./ServerUrl.jsx";

export default function Cell({
  content,
  header,
}) {

  function bidSelected(event) {
    const bid = event.target.dataset.bid;
    console.log("User bids " + bid);
    const bidObj = {bid: bid};
    const url = serverUrl + 'makeBid';
    axios.post(url, querystring.stringify(bidObj));
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
