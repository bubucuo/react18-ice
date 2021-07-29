// import {useReducer} from "react";
import {useReducer} from "./kreact/react";

function FunctionComponent(props) {
  // fiber(memoizedState)->hook0(next)->hook1(next)->hook2(next)->null
  const [count2, setCount2] = useReducer((x) => x + 1, 0);

  return (
    <div className="border">
      <p>{props.name}</p>

      <button
        onClick={() => {
          setCount2();
          // setCount2();
        }}>
        {count2}
      </button>
    </div>
  );
}

const jsx = (
  <div className="border">
    <h1>kaikeba</h1>
    <FunctionComponent name="fun" />
  </div>
);

export default jsx;
