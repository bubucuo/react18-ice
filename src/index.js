import ReactDOM from "react-dom";

import SuspenseListPage from "./pages/SuspenseListPage";
import SuspensePage from "./pages/SuspensePage";
import TestPage from "./pages/TestPage";
import TransitionPage from "./pages/TransitionPage";
import UseDeferredValuePage from "./pages/UseDeferredValuePage";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <UseDeferredValuePage />
  <SuspensePage />
);

// !-------------------------------------------

// import ReactDOM from "./kreact/react-dom";
// import "./index.css";
// import jsx from "./App";

// // ReactDOM.render(jsx, document.getElementById("root"));
// ReactDOM.createRoot(document.getElementById("root")).render(jsx);
