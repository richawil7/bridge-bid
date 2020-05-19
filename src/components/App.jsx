import React, {useState, useEffect} from "react";
// import { useCookies } from 'react-cookie';
import Scripts from "./Scripts.jsx";
import Show from "./Show.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import BidEntry from "./BidEntry.jsx";
import Hand from "./Hand.jsx";
import NewGame from "./NewGame.jsx";
import Status from "./Status.jsx";
import BidHistory from "./BidHistory.jsx";
import Refresh from "./Refresh.jsx";
import Position from "./Position.jsx";
import ShowHands from "./ShowHands.jsx";
import { SSEProvider } from 'react-hooks-sse';

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
  const [position, setPosition] = useState('North');
  const [state, setState] = useState(initState);
  const [showHands, setShowHands] = useState(false);
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
          <SSEProvider endpoint="http://localhost:3000/sse">
            <div class="row">
              <div class="col-lg-5">
                <Status state={state} setFx={setState} position={position}/>
              </div>
              <div class="col-lg-1"></div>
              <div class="col-lg-6">
                <BidEntry state={state} setFx={setState} />
              </div>
            </div>
            <div class="row">
              <div class="col-lg-6">
                <Hand state={state} position={position} />
              </div>
              <div class="col-lg-6">
                <BidHistory state={state} setFx={setState}/>
              </div>
            </div>
            <div class="control">
              <NewGame state={state} setFx={setState} setShow={setShowHands} />
              <Refresh />
              <ShowHands setFx={setShowHands} />
            </div>
          </SSEProvider>
        </div>
        ) : (null)
      }
      {(showHands) ?
        (<div class='allHands'>
          <div class="row">
            <div class="col-lg-4"></div>
            <div class="col-lg-4">
              <h3 id='North'>North</h3>
                <Hand state={state} position='North' />
              </div>
            <div class="col-lg-4"></div>
          </div>
          <div class="row">
            <div class="col-lg-4">
              <h3 id='West' >West</h3>
              <Hand state={state} position='West' />
            </div>
            <div class="col-lg-4"></div>
            <div class="col-lg-4">
              <h3 id='East'>East</h3>
              <Hand state={state} position='East' />
            </div>
          </div>
          <div class="row">
            <div class="col-lg-4"></div>
            <div class="col-lg-4">
              <h3 id='South'>South</h3>
              <Hand state={state} position='South' />
            </div>
            <div class="col-lg-4"></div>
          </div>
        </div>) : (null)
      }
      {(debug) ? (<Show state={state} />) : (console.log("Debug disabled"))}
      <Footer />
    </div>
  );
}

export default App;
