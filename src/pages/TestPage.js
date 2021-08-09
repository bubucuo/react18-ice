// export default function TestPage(props) {
//   return undefined;
// }

import React, {useState} from "react";

export default function TestPage() {
  const [text, setText] = useState("");
  const handle = (e) => {
    const newValue = e.target.value;
    console.log("a", newValue, navigator.scheduling.isInputPending()); //sy-log

    setText(newValue);
  };
  return (
    <div>
      <input type="text" value={text} onChange={handle} />
    </div>
  );
}
