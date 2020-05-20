import React from 'react';

function ShowHands(props) {

  return (
    <div>
      <button type="button" className="btn btn-sm btn-info ctrl-btn"
        onClick = {() => {
          props.setFx(true);
        }
      } > Show Hands
      </button>
    </div>
  );
}

export default ShowHands;
