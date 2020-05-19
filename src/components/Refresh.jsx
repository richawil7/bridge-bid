import React from 'react';

function Refresh() {

  return (
    <div id='refreshBtn'>
      <button type="button" className="btn btn-sm btn-danger ctrl-btn"
        onClick = {() => {
          getStatus(props.state, props.setFx);
        }
      } > Refresh
      </button>
    </div>
  );
}

export default Refresh;
