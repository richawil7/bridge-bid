import React from "react";

function Header() {

  return (
    <div>
      <header>
        <meta charSet="utf-8" />
        <title>BridgeBid</title>
      </header>
      <script>console.log("Running embedded script")</script>
      <script type="text/javascript" src="test.js" ></script>
      <script type="text/javascript" src="event.js" ></script>
      <h1 className="heading" >
        Practice Bridge Bidding
      </h1>
    </div>
  );
}

export default Header;
