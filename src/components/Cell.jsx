import * as React from 'react';
import axios from 'axios';
import querystring from 'querystring';
import serverUrl from "./ServerUrl.jsx";

export default function Cell({
  content,
  header,
  tableName,
  seat
}) {

  function bidSelected(event) {
    const bidStr = event.target.dataset.bid;
    const tableName = event.target.dataset.table;
    const seat = event.target.dataset.seat;
    console.log('Cell: tableName=' + tableName);
    console.log('Cell: seat=' + seat);
    console.log("User bids " + bidStr);
    const bidObj = {bid: bidStr};
    const url = serverUrl + tableName + '/' + seat + '/makeBid'
    console.log(url);
    axios.post(url, querystring.stringify(bidObj))
    .then(function (response) {
        console.log("Cell bidSelected: axios makeBid post result: " + response);
    })
    .catch(function (error) {
        console.log("Cell bidSelected: error in axios: " + error);
    });
  }

  const cellMarkup = header ? (
    <th className="Cell Cell-header">
      {content}
    </th>
  ) : (
    <td className="Cell" data-bid={content} data-table={tableName} data-seat={seat} onClick={bidSelected} >
      {content}
    </td>
  );

  return (cellMarkup);
}
