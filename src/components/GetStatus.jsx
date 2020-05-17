import React from "react";
import axios from 'axios';

function getStatus(st, setFx) {
  var foundChange = false;
  var changeCount = st.delta;
  axios.get('http://localhost:3000/update')
      .then(response => {
          console.log("getStatus: got response");
          if (response.data.message != st.message) {
            //console.log("Message changed");
            //state.message = response.data.message;
            foundChange = true;
          }
          if (response.data.bidHistory.length != st.bidHistory.length) {
            foundChange = true;
          }
          if (response.data.game != st.game) {
            //console.log("Game changed");
            foundChange = true;
            //state.game = response.data.game;
          }
          changeCount++;
          if (foundChange) {
            // changeCount++;
            console.log("getStatus: found change");
            st.bidHistory = response.data.bidHistory.slice();

            setFx({...st,
                      message: response.data.message,
                      bidder: response.data.bidder,
                      game: response.data.game,
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
//    setTimeout(getStatus, pollPeriod, st, setFx);
}

export default getStatus;
