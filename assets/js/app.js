import React from "react";
import {createRoot} from "react-dom/client";
import AppContainer from "./components/app-container";
const reactAppContainer = document.getElementById("react-app-container");
const root = createRoot(reactAppContainer);
root.render(<AppContainer />);

// // Establish Phoenix Socket and LiveView configuration.
// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
// import "phoenix_html";
// import {Socket} from "phoenix";
// import {LiveSocket} from "phoenix_live_view";
// import topbar from "../vendor/topbar";

// let csrfToken = document
//   .querySelector("meta[name='csrf-token']")
//   .getAttribute("content");
// let liveSocket = new LiveSocket("/live", Socket, {
//   longPollFallbackMs: 2500,
//   params: {_csrf_token: csrfToken},
// });

// // Show progress bar on live navigation and form submits
// topbar.config({barColors: {0: "#29d"}, shadowColor: "rgba(0, 0, 0, .3)"});
// window.addEventListener("phx:page-loading-start", (_info) => topbar.show(300));
// window.addEventListener("phx:page-loading-stop", (_info) => topbar.hide());

// // connect if there are any LiveViews on the page
// liveSocket.connect();

// // expose liveSocket on window for web console debug logs and latency simulation:
// // >> liveSocket.enableDebug()
// // >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// // >> liveSocket.disableLatencySim()
// window.liveSocket = liveSocket;
