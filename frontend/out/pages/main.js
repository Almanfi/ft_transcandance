/*
 * Routing Schema
 * Each route is an object with the following structure:
 * {
 *   path: "/pathname",           // The URL path for the route
 *   default: true/false,         // Default route, will be redirected to if navigate
 *                                // to a no existing route
 *   call: Component
 * }
 *
 * Example:
 * const Routes = [
 *   { path: "/home", call: Home, default: true }
 *   { path: "/user", call: User}
 *   { path: "/user/setting", call: UserSetting}
 * ];
 */
import Ura from "ura";
import Home from "./home/home.js";
import Login from "./login/login.js";
import User from "./user/user.js";
const Routes = [
    {
        path: "/home",
        call: Home,
        default: true
    },
    {
        path: "/user",
        call: User
    },
    {
        path: "/login",
        call: Login
    }
];
Ura.setRoutes(Routes);
Ura.start();
