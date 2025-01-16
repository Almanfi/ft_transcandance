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

import Home from "./home/home.jsx";
import Login from "./login/login.jsx";
import Signup from "./signup/signup.jsx";
import User from "./user/user.jsx";
import Chat from "./chat/chat.jsx";
import Friend from "./friend/friend.jsx";
import api from "../services/api.jsx";
import Game from "./game/game.jsx";
import Notifications from "./notifications/notifications.jsx";

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
  "/pages/Notifications/Notifications.css",
  /* components */
  "/components/Toast.css",
  "/components/Navbar.css",
]);

Ura.onNavigate(() => {
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
      "/notifications": Notifications
    });
  }
  else {
    // const [getGlobal, setGlobal] = GlobalUser;
    // setGlobal(undefined);

    Ura.rmCookie("id_key");

    Ura.setRoutes({
      "*": Login,
      "/home": Home,
      "/login": Login,
      "/signup": Signup,
    });
  }
})

Ura.start();