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

import home from "./home/home.js";
import login from "./login/login.js";
import signup from "./signup/signup.js";
import test from "./test/test.js";
import user from "./user/user.js";
import Chat from "./chat/chat.jsx";
import Friend from "./friend/friend.jsx";

Ura.setRoutes({
  "*": home,
  "/home": home,
  "/login": login,
  "/signup": signup,
  "/test": test,
  "/user": user,
  "/chat": Chat,
  "/friend": Friend,
});

Ura.setStyles([
  "./pages/home/home.css",
  "./pages/login/login.css",
  "./pages/main.css",
  "./pages/signup/signup.css",
  "./pages/test/test.css",
  "./pages/user/settings/settings.css",
  "./pages/user/user.css",
  "./pages/utils/Award/Award.css",
  "./pages/utils/Navbar/Navbar.css",
  "./pages/utils/Toast/Toast.css",
  "./pages/chat/chat.css",
  "./pages/chat/create/create.css",
  "./pages/friend/friend.css",
  "./pages/friend/settings/settings.css",
]);

Ura.start();