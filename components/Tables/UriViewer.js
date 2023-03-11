import React from "react";

const MyComponent = (props) => {
  const { uri, ...rest } = props;
  return (
    <div>
      <h1>JSON Example</h1>
      <pre>{JSON.stringify(uri, null, 2)}</pre>
    </div>
  );
};

export default MyComponent;
