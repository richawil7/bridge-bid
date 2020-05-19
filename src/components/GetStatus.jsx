import React from "react";
import axios from 'axios';

function getStatus(st, setFx) {
  var foundChange = false;
  var changeCount = st.delta;
  axios.get('http://192.168.1.5:3000/update')
      .then(response => {
          // console.log("getStatus: got response");
          if (response.data.message != st.message) {
            //console.log("Message changed");
            //state.message = response.data.message;
            foundChange = true;
          }
          if (response.data.bidHistory.length != st.bidHistory.length) {
            foundChange = true;
          }
          changeCount++;
          if (foundChange) {
            // changeCount++;
            // console.log("getStatus: found change");
            st.bidHistory = response.data.bidHistory.slice();

            setFx({...st,
                      message: response.data.message,
                      bidder: response.data.bidder,
                      gameNum: response.data.gameNum,
                      dealer: response.data.dealer,
                      delta: changeCount});
          }
          // state.bidHistory.forEach(function (item, index){
          //  console.log("Bid hist: " + item.level + item.suit);
          //});
        })
      .catch(function (error) {
          console.log("Error in axios: " + error);
      })
}

export default getStatus;
