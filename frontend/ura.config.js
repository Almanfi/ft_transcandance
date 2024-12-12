import { setConfig } from "./scripts/utils.js";

setConfig({
  dirRouting: false,
  defaultRoute: "/home", /* will be used only if dirRouting is true */
  port: 17000,
  serverTiming: 5,
  style: "css",
  ext: "jsx"
})