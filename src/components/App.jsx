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
import Start from "./Start.jsx";
import Position from "./Position.jsx";
// import startPolling from "./GetStatus.jsx";
import { SSEProvider } from 'react-hooks-sse';
// import Comments from "./Comments.jsx";

// import IFrame from "./IFrame.jsx";

import '../App.css';

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
      <SSEProvider endpoint="http://localhost:3000/sse">
        <Status state={state} setFx={setState} />
        <NewGame state={state} setFx={setState} />
        <BidHistory state={state} setFx={setState}/>
      </SSEProvider>
      <BidEntry state={state} setFx={setState} />
      <Hand state={state} position={position} />
      <Show state={state} />
      <Footer />
    </div>
  );
}

export default App;
