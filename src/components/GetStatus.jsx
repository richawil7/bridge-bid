import React from "react";
import axios from 'axios';
import serverUrl from "./ServerUrl.jsx";

function getStatus(st, setFx, tableName) {
  var currentEpoch = st.epoch;
  // console.log('getStatus for table ' + tableName);
  const url = serverUrl + tableName + '/update';
  axios.get(url)
      .then(response => {
          //console.log("getStatus: got response");
          //console.log("getStatus: currentEpoch=" + currentEpoch);
          //console.log("getStatus: newEpoch=" + response.data.epoch);
          if (response.data.epoch != currentEpoch) {
            // console.log("getStatus: found change");
            st.bidHistory = response.data.bidHistory.slice();
            st.chats = response.data.chats.slice();
            setFx({...st,
                      message: response.data.message,
                      bidder: response.data.bidder,
                      dealer: response.data.dealer,
                      epoch: response.data.epoch});
          }
        })
      .catch(function (error) {
          console.log("Error in axios: " + error);
      })
}

export default getStatus;
