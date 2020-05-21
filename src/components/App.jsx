import React, {useState, useEffect} from "react";
// import { useCookies } from 'react-cookie';
import Scripts from "./Scripts.jsx";
import Show from "./Show.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
//import BidEntry from "./BidEntry.jsx";
import BidGrid from "./BidGrid.jsx";
import Hand from "./Hand.jsx";
import NewGame from "./NewGame.jsx";
import Status from "./Status.jsx";
import BidHistory from "./BidHistory.jsx";
import HandEvalBtn from "./HandEvalBtn.jsx";
import RebidBtn from "./RebidBtn.jsx";
import HandEval from "./HandEval.jsx";
import Position from "./Position.jsx";
import ShowHands from "./ShowHands.jsx";
import { SSEProvider } from 'react-hooks-sse';
import serverUrl from "./ServerUrl.jsx";

// Install all of bootstrap
import 'bootstrap';
// Or install only the pieces you need
//import 'bootstrap/js/dist/util';
//import 'bootstrap/js/dist/dropdown';
import '../scss/app.scss';

// Custom style sheet for this application
import '../styles/styles.css';


function App() {

  var initState = {
    message: "Client side Uninitialized",
    bidder: "Unknown",
    game: "init",
    bidHistory: [],
    dealer: "Unknown",
    delta: 0,
    gameNum: 0
  };
  const [state, setState] = useState(initState);
  const [position, setPosition] = useState(undefined);
  const [showHands, setShowHands] = useState(false);
  const [showEval, setShowEval] = useState(false);
  const [handEval, setHandEval] = useState(undefined);
  const serverEventUrl = serverUrl + "sse"
  var debug = false;
  //const [cookies, setCookie] = useCookies(['position']);
  // setCookie('position', newName, { path: '/' });

  // console.log("App entry");

  /* Set up polling of the server state
  if (state.delta == 0) {
    console.log("Start polling");
    startPolling(state, setState);
  };
*/

  useEffect(() => {
    console.log("In App useEffect. Delta=" + state.delta);
  });

  return (
    <div>
      <Header />
      <Scripts />
      <Position state={state} setFx={setState} position={position} setPosition={setPosition} />
      {(position != undefined) ?
        (<div>
          <SSEProvider endpoint={serverEventUrl}>
            <div className="row">
              <div className="col-lg-6">
                <Status state={state} setFx={setState} position={position}/>
              </div>
              <div className="col-lg-2">
                <BidHistory state={state} setFx={setState}/>
              </div>
              <div className="col-lg-2">
                <BidGrid state={state} setFx={setState} position={position}/>
              </div>
              <div className="col-lg-2"></div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <Hand state={state} position={position} />
              </div>
              <div className="col-lg-2 control">
                <NewGame state={state} setFx={setState} setShowHand={setShowHands} setShowEval={setShowEval}/>
                <HandEvalBtn position={position} setShowFx={setShowEval} setEvalFx={setHandEval}/>
                <RebidBtn />
                <ShowHands setFx={setShowHands} />
              </div>
              <div className="col-lg-3">
                <HandEval showEval={showEval} handEval={handEval} />
              </div>
              <div className="col-lg-1"></div>
            </div>
          </SSEProvider>
        </div>
        ) : (null)
      }
      {(showHands) ?
        (<div className='allHands'>
          <div className="row">
            <div className="col-lg-4"></div>
            <div className="col-lg-4">
              <h3 id='North'>North</h3>
                <Hand state={state} position='North' />
              </div>
            <div className="col-lg-4"></div>
          </div>
          <div className="row">
            <div className="col-lg-4">
              <h3 id='West' >West</h3>
              <Hand state={state} position='West' />
            </div>
            <div className="col-lg-2"></div>
            <div className="col-lg-4">
              <h3 id='East'>East</h3>
              <Hand state={state} position='East' />
            </div>
            <div className="col-lg-2"></div>
          </div>
          <div className="row">
            <div className="col-lg-4"></div>
            <div className="col-lg-4">
              <h3 id='South'>South</h3>
              <Hand state={state} position='South' />
            </div>
            <div className="col-lg-4"></div>
          </div>
        </div>) : (null)
      }
      {(debug) ? (<Show state={state} />) : (console.log("Debug disabled"))}
      <Footer />
    </div>
  );
}

export default App;
