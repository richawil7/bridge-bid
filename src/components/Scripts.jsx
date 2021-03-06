import React, {useState, useEffect} from "react";

function Scripts() {
  var [loaded, error] = useScript('test.js');
  if (loaded && error) {
    console.log("Error running test.js: " + error);
  }
/*
  [loaded, error] = useScript('https://code.jquery.com/jquery-3.4.1.slim.min.js');
  if (loaded && error) {
    console.log("Error running jquery: " + error);
  }
  [loaded, error] = useScript('https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js');
  if (loaded && error) {
    console.log("Error running popper: " + error);
  }
  [loaded, error] = useScript('https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js');
  if (loaded && error) {
    console.log("Error running popper: " + error);
  }
  */

  return (
    <div>
      {loaded && error && (
        <div>
          Script function call response: <b>{error}</b>
        </div>
      )}
    </div>
  );
}

// Hook
let cachedScripts = [];
function useScript(src) {
  // Keeping track of script loaded and error state
  const [state, setState] = useState({
    loaded: false,
    error: false
  });

  useEffect(
    () => {
      // If cachedScripts array already includes src that means another instance ...
      // ... of this hook already loaded this script, so no need to load again.
      if (cachedScripts.includes(src)) {
        setState({
          loaded: true,
          error: false
        });
      } else {
        cachedScripts.push(src);
        // Create script
        let script = document.createElement('script');
        script.src = src;
        script.async = true;

        // Script event listener callbacks for load and error
        const onScriptLoad = () => {
          setState({
            loaded: true,
            error: false
          });
        };

        const onScriptError = () => {
          // Remove from cachedScripts we can try loading again
          const index = cachedScripts.indexOf(src);
          if (index >= 0) cachedScripts.splice(index, 1);
          script.remove();
          setState({
            loaded: true,
            error: true
          });
        };

        script.addEventListener('load', onScriptLoad);
        script.addEventListener('error', onScriptError);

        // Add script to document body
        document.body.appendChild(script);

        // Remove event listeners on cleanup
        return () => {
          script.removeEventListener('load', onScriptLoad);
          script.removeEventListener('error', onScriptError);
        };
      }
    },
    [src] // Only re-run effect if script src changes
  );

  return [state.loaded, state.error];
}

export default Scripts;
