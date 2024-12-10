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
import "./styles.js";
import Home from "./home/home.js";
import Login from "./login/login.js";
import User from "./user/user.js";
import Signup from "./signup/signup.jsx";
import Settings from "./user/settings/settings.jsx";
const Routes = {
    "*": Home,
    "/home": Home,
    "/user": User,
    "/login": Login,
    "/signup": Signup,
};
Ura.setRoutes(Routes);
Ura.start();
