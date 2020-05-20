import React from 'react';
import axios from 'axios';

function HandEvalBtn(props) {

  function clickHandler() {
    // Ask the server for the evaluation for my hand
    const url = 'http://192.168.1.5:3000/' + props.position + '/eval'
    axios.get(url)
        .then(response => {
            console.log("getHandEval: got response");
            console.log(response.data);

            props.setEvalFx({
                        distribution: response.data.distribution,
                        balance: response.data.balance,
                        hcp: response.data.hcp,
                        distPts: response.data.distPts,
                        totalPts: response.data.totalPts,
                        openBid: response.data.openBid
                        });
            props.setShowFx(true);
          })
        .catch(function (error) {
            console.log("Error in axios: " + error);
        })
  }

  return (
    <div>
      <button type="button" className="btn btn-sm btn-danger ctrl-btn"
        onClick={clickHandler} > Evaluate
      </button>
    </div>
  );
}

export default HandEvalBtn;
