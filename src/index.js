import ReactDOM from "react-dom";
// import SuspensePage from "./pages/SuspensePage";

import "./index.css";
import SuspenseListPage from "./pages/SuspenseListPage";
import SuspensePage from "./pages/SuspensePage";
import TransitionPage from "./pages/TransitionPage";
import UseDeferredValuePage from "./pages/UseDeferredValuePage";
// ReactDOM.render(<SuspensePage />, document.getElementById("root"));

ReactDOM.createRoot(document.getElementById("root")).render(<TransitionPage />);
