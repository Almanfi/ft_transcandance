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
import Game from "./game/game.js";
import api from "../services/api.js";
import { GlobalUser } from "../services/store.js";
// import Test from "./test/test.js";

Ura.setStyles([
  "/pages/home/home.css",
  "/pages/login/login.css",
  "/pages/main.css",
  "/pages/signup/signup.css",
  "/pages/test/test.css",
  "/pages/user/settings/settings.css",
  "/pages/user/user.css",
  "/pages/chat/chat.css",
  "/pages/friend/friend.css",
  "/pages/friend/settings/settings.css",
  /* components */
  "/components/Toast/Toast.css",
  "/components/Navbar/Navbar.css",
  "/pages/game/game.css"
]);

function Toast({ message, delay }) {
  const [render] = Ura.init();

  return render(() => (
    <root>
      <div className="utils-toast" style={{ animationDelay: `${delay}s`, backgroundColor: "green" }}>
        <h4>{message}</h4>
      </div>
    </root>
  ));
}

Ura.onNavigate(() => {
  if (Ura.getCookie("id_key")) {
    api.openSocket();

    api.setEvent("friendship_received", async (data) => {
      const res = await api.getUsersById([data.user_id]);
      console.log("get user", res);
      Ura.create(<Toast message={`new invitation from ${res[0].username}`} delay={1} />);
      Ura.refresh();
    })

    Ura.setRoutes({
      "*": Home,
      "/home": Home,
      "/user": User,
      "/chat": Chat,
      "/friend": Friend,
      "/game": Game,
      "/friend": Friend,
    });
  }
  else {
    const [getGlobal, setGlobal] = GlobalUser;

    Ura.rmCookie("id_key");
    setGlobal(undefined);

    Ura.setRoutes({
      "*": Login,
      "/home": Home,
      "/login": Login,
      "/signup": Signup,
    });
  }
})

Ura.start();