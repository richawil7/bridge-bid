import React from 'react';

function Refresh() {

  return (
    <div>
      <button type="button" onClick = {() => {
          getStatus(props.state, props.setFx);
        }
      } > Refresh
      </button>
    </div>
  );
}

export default Refresh;
