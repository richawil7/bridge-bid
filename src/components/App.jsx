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
import { SSEProvider } from 'react-hooks-sse';

// Install all of bootstrap
//import 'bootstrap';
// Or install only the pieces you need
//import 'bootstrap/js/dist/util';
//import 'bootstrap/js/dist/dropdown';
//import '../scss/app.scss';

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
  const [position, setPosition] = useState(undefined);

  const [state, setState] = useState(initState);

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
            <Status state={state} setFx={setState} position={position}/>
            <NewGame state={state} setFx={setState} />
            <Refresh />
            <BidHistory state={state} setFx={setState}/>
          </SSEProvider>
          <Hand state={state} position={position} />
          <BidEntry state={state} setFx={setState} />
        </div>
        ) : (null)
      }
      {(debug) ? (<Show state={state} />) : (console.log("Debug disabled"))}
      <Footer />
    </div>
  );
}

export default App;
