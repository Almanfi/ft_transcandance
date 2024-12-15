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
import home from ".//home/home.js";
import login from ".//login/login.js";
import signup from ".//signup/signup.js";
import test from ".//test/test.js";
import user from ".//user/user.js";
import settings from "./user/settings/settings.js";
Ura.setRoutes({
    "*": home,
    "/home": home,
    "/login": login,
    "/signup": signup,
    "/test": test,
    "/user": user,
    "/user/settings": settings
});
Ura.setStyles([
    "./home/home.css",
    "./login/login.css",
    ".//main.css",
    "./signup/signup.css",
    "./test/test.css",
    "./user/settings/settings.css",
    "./user/user.css",
    "./utils/Award/Award.css",
    "./utils/Navbar/Navbar.css",
    "./utils/Toast/Toast.css"
]);
Ura.start();
