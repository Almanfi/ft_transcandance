import Ura from "ura";
import Toast from "../components/Toast.js";
import events from "./events.js";

const endpoint = "https://" + window.location.hostname + ":8000";

async function signup(user) {
  const response = await fetch(`${endpoint}/users/`, {
    method: "POST",
    body: user,
  });

  if (response.ok) {
    const body = await response.json();
    return body;
  } else {
    const body = await response.json();
    throw body;
  }
}

async function login(user) {
  const response = await fetch(`${endpoint}/users/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(user),
  });
  if (response.ok) {
  } else {
    const body = await response.json();
    console.log("Error login users", body.message);
    throw body;
  }
}

/**
 * User Information
 * -----------------
 * Created At       : 2024-12-30T14:05:15.080852Z
 * Display Name     : yuliy
 * First Name       : mohammed
 * Last Name        : hrima
 * ID               : b1c67e5f-5ca7-4b43-98e8-d9cd25df3031
 * OAuth User       : false
 * OAuth Username   : null
 * Profile Picture  : /static/rest/images/users_profiles/profile.jpg
 * Status           : disconnected
 * Username         : mhrima
 */

async function getUser() {
  const response = await fetch(`${endpoint}/users/`, { credentials: "include" });
  if (response.ok) {
    const body = await response.json();
    return body;
  } else {
    const body = await response.json();
    throw body;
  }
}

async function getUsersById(ids) {
  const response = await fetch(`${endpoint}/users/fetch/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(ids),
  });
  if (response.ok) {
    const body = await response.json();
    return body;
  } else {
    const body = await response.json();
    throw body;
  }
}

async function searchUser(searchTerm) {
  const response = await fetch(`${endpoint}/users/search/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ search_term: searchTerm }),
  });
  if (response.ok) {
    const body = await response.json();
    return body;
  } else {
    const body = await response.json();
    throw body;
  }
}

async function getPicture(pathname) {
  const response = await fetch(`${endpoint}${pathname}`, {
    method: "GET",
    credentials: "include",
    mode: "no-cors",
  });
  if (response.ok) {
    const body = await response.blob();
    const imageUrl = URL.createObjectURL(body);
    return imageUrl;
  } else {
    const body = await response.text();
    throw body;
  }
}

/**
 * Editable User Data
 * -------------------
 * - Display Name      : Can be changed
 * - First Name        : Can be changed
 * - Last Name         : Can be changed
 * - Profile Picture   : Can be changed
 * - Username          : Can be changed
 */
async function updateUser(data) {
  const response = await fetch(`${endpoint}/users/`, {
    method: "PATCH",
    credentials: "include",
    body: data,
  });
  if (response.ok) {
  } else {
    const body = await response.json();
    console.error(body);
    throw body;
  }
}
// a1d00901-1b8e-4d62-9a48-13c1a318a8d1

async function deleteUser() {
  const response = await fetch(`${endpoint}/users/`, {
    method: "DELETE",
    credentials: "include",
  });
  if (response.ok) {
    const out = await response.json();
    console.log("success deleting", out);
    Ura.rmCookie("id_key");
    logout();
  } else {
    const body = await response.json();
    console.error("error deleting", body);
    throw body;
  }
}

/**
 * User Relationships
 * -------------------
 * - Blocks   : [] // List of blocked users
 * - Friends  : [] // List of existing friends
 * - Invited  : [] // Received invitations
 * - Invites  : [] // Sent invitations
 */

async function getRelations() {
  const response = await fetch(`${endpoint}/relationships/`, {
    credentials: "include",
  });
  if (response.ok) {
    const body = await response.json();
    return body;
  } else {
    const body = await response.json();
    throw body;
  }
}

async function inviteFriend(friendId) {
  const response = await fetch(`${endpoint}/relationships/invite/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ friend_id: friendId }),
  });
  if (response.ok) {
    const body = await response.json();
    return body;
  } else {
    const body = await response.json();
    throw body;
  }
}

async function acceptInvitation(id) {
  const response = await fetch(`${endpoint}/relationships/invite/accept/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ invitation_id: id }),
  });
  if (response.ok) {
    const body = await response.json();
    return body;
  } else {
    const body = await response.json();
    throw body;
  }
}

async function refuseInvitation(id) {
  const response = await fetch(`${endpoint}/relationships/invite/refuse/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ invitation_id: id }),
  });
  if (response.ok) {
    const body = await response.json();
    return body;
  } else {
    const body = await response.json();
    throw body;
  }
}

async function cancelInvitation(id) {
  const response = await fetch(`${endpoint}/relationships/invite/cancel/`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ invitation_id: id }),
  });
  if (response.ok) {
    const body = await response.json();
    return body;
  } else {
    const body = await response.json();
    throw body;
  }
}

async function unFriend(id) {
  const response = await fetch(`${endpoint}/relationships/unfriend/`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ friendship_id: id }),
  });
  if (response.ok) {
    const body = await response.json();
    return body;
  } else {
    const body = await response.json();
    throw body;
  }
}

async function blockUser(id) {
  const response = await fetch(`${endpoint}/relationships/block/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ user_id: id }),
  });
  if (response.ok) {
    const body = await response.json();
    return body;
  } else {
    const body = await response.json();
    throw body;
  }
}

async function unblockUser(id) {
  const response = await fetch(`${endpoint}/relationships/unblock/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ block_id: id }),
  });
  if (response.ok) {
    const body = await response.json();
    return body;
  } else {
    const body = await response.json();
    throw body;
  }
}

// Received invitations
async function getInvited() {
  const relations = await getRelations();
  const data = relations.invited.map((invite) => invite.from_user);
  const ids = await getUsersById(data);

  for (const fetchedUser of ids) {
    for (const invite of relations.invited) {
      if (invite.from_user == fetchedUser.id) {
        fetchedUser["invite_id"] = invite["id"];
        break;
      }
    }
  }
  return ids;
}

// sent invitations
async function getInvites() {
  const relations = await getRelations();
  const data = relations.invites.map((invite) => invite.to_user);

  const ids = await getUsersById(data);
  for (const fetchedUser of ids) {
    for (const invite of relations.invites) {
      if (invite.to_user == fetchedUser.id) {
        fetchedUser["invite_id"] = invite["id"];
        break;
      }
    }
  }
  return ids;
}

async function getBlocks() {
  const relations = await getRelations();
  const user = await api.getUser();
  const data = [];

  for (const invite of relations.blocks) {
    if (user.id == invite.from_user) data.push(invite.to_user);
    else data.push(invite.from_user);
  }
  const ids = await getUsersById(data);
  for (const fetchedUser of ids) {
    for (const invite of relations.blocks) {
      if (invite.from_user == fetchedUser.id || invite.to_user == fetchedUser.id) {
        // console.warn("found");
        fetchedUser["invite_id"] = invite["id"];
        break;
      }
    }
  }
  return ids;
}

async function getFriends() {
  const relations = await getRelations();
  const user = await api.getUser();
  const data = [];

  for (const invite of relations.friends) {
    if (user.id == invite.from_user) data.push(invite.to_user);
    else data.push(invite.from_user);
  }

  const ids = await getUsersById(data);
  for (const fetchedUser of ids) {
    for (const invite of relations.friends) {
      if (invite.from_user == fetchedUser.id || invite.to_user == fetchedUser.id) {
        fetchedUser["invite_id"] = invite["id"];
        break;
      }
    }
  }
  return ids;
}

// Error handeling
function handleError(err) {
  const Errors = [];
  console.warn("Error", err);
  if (err.message) Errors.push(err.message);
  else if (err.status === 403) Errors.push("Internal Error");
  else if (typeof err == "object") {
    Object.keys(err).forEach((key) => {
      if (typeof err[key] === "string") Errors.push(err[key]);
      else if (err[key].length && typeof err[key][0] === "string")
        err[key].forEach((elem) => Errors.push(`${elem} (${key})`));
      else Errors.push(key);
    });
  }
  Errors.forEach((e, i) => Ura.create(<Toast message={e} delay={i} />));
  if (["9999", "9998"].includes(err.error_code)) {
    Ura.rmCookie("id_key");
    // Ura.navigate("/home");
    window.location.reload();
  }
  return err.status == 403;
}

function logout() {
  closeSockets();
  Ura.rmCookie("id_key");
  Ura.navigate("/home");
  window.location.reload();
}

// Web Sockets
let webSocket = null;
const websocketApi = "wss://" + window.location.hostname + ":8000";

let conRetries = 0;
function openSocket() {
  if (!webSocket || webSocket.readyState === WebSocket.CLOSED) {
    console.log("Creating a new WebSocket connection.");
    webSocket = new WebSocket(`${websocketApi}/ws/messaging/`);
    webSocket.onopen = (event) => {
      conRetries = 0;
      console.log("WebSocket connection established.");
    };

    webSocket.onmessage = (event) => {
      console.log("Message from server:");
      console.log("event type:", event.type);
      console.log("data:", event.data);

      const data = JSON.parse(event.data);
      switch (data.type) {
        case "friendship_received": {
          events.emit("friendship_received", data);
          break;
        }
        case "friendship_accepted": {
          events.emit("friendship_accepted", data);
          break;
        }
        case "chat.message.retrieve": {
          events.emit("chat.message.retrieve", data);
          break;
        }
        case "chat.message": {
          events.emit("chat.message", data);
          break;
        }
        default:
          console.error("unhanled event:", data.type);
          break;
      }

    };

    webSocket.onclose = (event) => {
      console.error("WebSocket connection closed. Reconnecting...");
      // Events = {};
      webSocket = null;
      // if (conRetries < 3) {
      //   setTimeout(() => { conRetries++; openSocket(); }, 3000);
      // } else {
      //   console.error("Maximum reconnection attempts reached.");
      // }
    };
    webSocket.onerror = (err) => { handleError(err); };
  } else {
    console.log("WebSocket already exists.");
  }
  return webSocket;
}

function sendMessage(dest, message) {
  try {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      console.warn("Sending message");
      webSocket.send(JSON.stringify({ type: "chat.message", friend_id: dest, message }));
    } else {
      console.error("WebSocket is not open. Cannot send message.");
    }
  } catch (error) {
    console.error("Failed to send message:", error);
  }
}

const retrieveMessages = async (id) => {
  try {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      console.log("Getting messages from", id);
      webSocket.send(JSON.stringify({ type: "chat.message.retrieve", friend_id: id }));
    } else {
      console.error("WebSocket is not open. Cannot retrieve messages.");
    }
  } catch (error) {
    console.error("Failed to retrieve messages:", error);
  }
};

async function getGameInvites() {
  const response = await fetch(`${endpoint}/games/`, {
    method: "GET",
    credentials: "include",
  });
  if (response.ok) {
    const body = await response.json();
    console.log("Game Invites Got: ", body);
    return body;
  }
  else {
    const body = await response.json();
    console.log("Error Getting Game Invites: ", body);
    throw body
  }

}

async function createGame() {
  const response = await fetch(`${endpoint}/games/`, {
    method: "POST",
    credentials: "include"
  })
  if (response.ok) {
    const body = await response.json();
    console.log("Game created Sucesfully: ", body);
    return body;
  }
  else {
    const body = await response.json();
    console.log("Error Creating Game: ", body);
    throw body
  }
}

async function invitePlayer(game_id, invited_id) {
  const res = await fetch(`${endpoint}/games/invite/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game_id, invited_id }),
    credentials: "include"
  })
  if (res.ok) {
    const body = await res.json();
    console.log("invited player: ", body)
    return body
  }
  else {
    const body = await res.json();
    console.log("Error invite player : ", body);
    throw body
  }
}


async function acceptGameInvite(invite_id) {
  const res = await fetch(`${endpoint}/games/invite/accept/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invite_id }),
    credentials: "include"
  })
  if (res.ok) {
    const body = await res.json();
    console.log("accepted game invite: ", body)
    return body
  }
  else {
    const body = await res.json();
    console.log("Error accepting game invite : ", body);
    throw body
  }
}

async function refuseGameInvite(invite_id) {
  const res = await fetch(`${endpoint}/games/invite/refuse/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invite_id }),
    credentials: "include"
  })
  if (res.ok) {
    const body = await res.json();
    console.log("refused game invite: ", body)
    return body
  }
  else {
    const body = await res.json();
    console.log("Error refusing game invite : ", body);
    throw body
  }
}

export async function cancelGameInvite(invite_id) {
  const res = await fetch(`${endpoint}/games/invite/cancel/`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invite_id }),
    credentials: "include"
  })
  if (res.ok) {
    const body = await res.json();
    console.log("canceled game invite: ", body)
    return body
  }
  else {
    const body = await res.json();
    console.log("Error canceling game invite: ", body);
  }
}

let gameSocket = null;
function openGameSocket(game_id) {
  gameSocket = new WebSocket(`${websocketApi}/ws/game/${game_id}/`);
  gameSocket.onopen = (e) => { console.log("Connected to game Lobby") };
  gameSocket.onmessage = (e) => { console.log("Game Lobby message: ", e.data) }
  gameSocket.onclose = (e) => {
    console.log("Game Lobby quit");
    gameSocket = null;
  }
  gameSocket.onerror = (err) => handleError(err);
}

let matchmakingSocket = null
export function openMatchMakingSocket() {
  matchmakingSocket = new WebSocket(`${websocketApi}/ws/matchmaking/`);
  matchmakingSocket.onopen = (e) => { console.log("Connected to matchmaking socket") };
  matchmakingSocket.onmessage = (e) => { console.log("Matchmaking Socket message", e.data) }
  matchmakingSocket.onclose = (e) => { console.log("Matchmaking Socket Quit") }
}

let tournamentMakingSocket = null
export function openTournamentMakingSocket() {
  tournamentMakingSocket = new WebSocket(`${websocketApi}/ws/tournamentmaking/`)
  tournamentMakingSocket.onopen = (e) => { console.log("Connected to tournament making socket") };
  tournamentMakingSocket.onmessage = (e) => { console.log("Tournament Making Socket Message", e.data) }
  tournamentMakingSocket.onclose = (e) => { console.log("Matchmaking Socket Quit") }
}

function closeSockets() {
  webSocket?.close();
  gameSocket?.close();
  matchmakingSocket?.close();
  tournamentMakingSocket?.close();

  webSocket = null;
  gameSocket = null;
  matchmakingSocket = null;
  tournamentMakingSocket = null;
}

const api = {
  endpoint,
  signup,
  login,
  logout,
  getUser,
  getPicture,
  updateUser,
  deleteUser,
  searchUser,

  getRelations,
  getInvited,
  getInvites,
  getBlocks,
  getFriends,
  getGameInvites,
  // setEvent,

  inviteFriend,
  acceptInvitation,
  refuseInvitation,
  unFriend,
  unblockUser,
  blockUser,
  cancelInvitation,
  getUsersById,
  handleError,
  openSocket,
  sendMessage,
  retrieveMessages,

  openGameSocket,
  createGame,
  invitePlayer,
  acceptGameInvite,
  refuseGameInvite,
  cancelGameInvite,

  openMatchMakingSocket,
  openTournamentMakingSocket,

  websocketApi,
  closeSockets
};

export default api;
