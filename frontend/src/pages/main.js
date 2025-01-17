/*
 * Routing Schema
 * Each route is an object with the following structure:
 * {
 *   "/pathname": Component,      
 *    // key is The URL path for the route
 *    // '*' is for default route, will be redirected to if navigate
 *    // Component: the component that will be displayed
 * }
 *
 * Example:
 * const Routes = {
 *    "/home": Home,
 *    "/user": User,
 *    "/user/setting": Setting
 * }
 */

import Ura from "ura";

import Home from "./home/home.js";
import Login from "./login/login.js";
import Signup from "./signup/signup.js";
import User from "./user/user.js";
import Chat from "./chat/chat.js";
import Friend from "./friend/friend.js";
import api from "../services/api.js";
import Game from "./game/game.js";
import Notifications from "./notifications/notifications.js";
import Settings from "./settings/settings.js";

Ura.setStyles([
  "/pages/home/home.css",
  "/pages/login/login.css",
  "/pages/main.css",
  "/pages/signup/signup.css",
  "/pages/user/user.css",
  "/pages/user/utils/settings.css",
  "/pages/chat/chat.css",
  "/pages/friend/friend.css",
  "/pages/game/game.css",
  "/pages/notifications/notifications.css",
  "/pages/settings/settings.css",
  /* components */
  "/components/Toast.css",
  "/components/Navbar.css",
]);

Ura.onNavigate(() => {
  // console.error("exists:", Ura.getCookie("id_key"));
  if (Ura.getCookie("id_key")) {

    api.openSocket();

    Ura.setRoutes({
      "*": Home,
      "/home": Home,
      "/user": User,
      "/chat": Chat,
      "/friend": Friend,
      "/game": Game,
      "/friend": Friend,
      "/notifications": Notifications,
      "/settings": Settings
    });
  }
  else {
    Ura.rmCookie("id_key");
    api.closeSockets();

    Ura.setRoutes({
      "*": Login,
      "/home": Home,
      "/login": Login,
      "/signup": Signup,
    });
  }
})

Ura.start();