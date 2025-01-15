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
import Comp from "./comp/comp.js";

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
  /* components */
  "/components/Toast.css",
  "/components/Navbar.css",

  "/pages/comp/comp.css",
  "/pages/comp0/comp0.css",
  "/pages/comp1/comp1.css",
]);

Ura.onNavigate(() => {
  if (Ura.getCookie("id_key")) {
    api.openSocket();

    // api.setEvent("friendship_received", async (data) => {
    //   console.log("data:", data);
    //   const res = await api.getUsersById([data.user_id]);
    //   // console.log("get user", res);
    //   Ura.create(<Toast message={`new invitation from ${res[0].display_name}`} delay={1} />);
    //   Ura.refresh();
    //   if (handelNotif.setter) {
    //     console.error("enter");

    //     const updateNotifications = async () => {
    //       const res = await api.getInvited();
    //       const invites = res.map(e => ({
    //         type: "friendship",
    //         content: `new friend request from ${e.display_name}`,
    //         accept: async () => {
    //           await api.acceptInvitation(e.invite_id);
    //           if (handelNotif.setter) updateNotifications();
    //         },
    //         refuse: async () => {
    //           await api.refuseInvitation(e.invite_id);
    //           if (handelNotif.setter) updateNotifications();
    //         },
    //       }))
    //       handelNotif.setter(invites);
    //     }
    //     updateNotifications();
    //     console.log("new value", handelNotif.getter());

    //   }
    //   else {
    //     console.error("don't have setter");
    //   }
    // })

    // api.setEvent("game_invite", (data) => {
    //   setter([
    //     ...getter(),
    //     inviteId
    //   ])
    //   const [getter, setter] = GameState;
    //   const inviteId = data.invite;

    //   if (handelNotif.setter) {
    //     console.error("enter");

    //     const updateNotifications = async () => {
    //       const res = await api.getGameInvites();
    //       const gameInvites = res.map(e => ({
    //         type: "game invitation",
    //         content: `new game request from `,
    //         accept: async () => {
    //           // await api.acceptInvitation(e.invite_id);
    //           // if (handelNotif.setter) updateNotifications();
    //         },
    //         refuse: async () => {
    //           // await api.refuseInvitation(e.invite_id);
    //           // if (handelNotif.setter) updateNotifications();
    //         },
    //       }))
    //       handelNotif.setter(gameInvites);
    //     }
    //     updateNotifications();
    //     console.log("new value", handelNotif.getter());
    //   }
    //   else {
    //     console.error("don't have setter");
    //   }

    // })

    Ura.setRoutes({
      "*": Home,
      "/home": Home,
      "/user": User,
      "/chat": Chat,
      "/friend": Friend,
      "/game": Game,
      "/friend": Friend,
      "/comp": Comp
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