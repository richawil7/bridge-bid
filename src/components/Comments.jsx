import React from 'react';
import { useSSE } from 'react-hooks-sse';

function Comments() {
  const last = useSSE('comments', {
    value: '0R',
  });

  return (
    <p>
      {console.log(last.value)}
      {last.value}
    </p>
  );
};

export default Comments;
