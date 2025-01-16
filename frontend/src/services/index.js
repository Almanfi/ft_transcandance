// Array of items
import api from "./api.jsx";
import users from "./users.js";
const Selected = new Set();

const getLast = () => [...Selected].at(-1);

const root = document.getElementById('users');
const ids = {};

users.forEach((item, index) => {
  const div = document.createElement('div');
  div.textContent = item.username;
  div.style.cursor = 'pointer';
  div.addEventListener('click', () => {
    if (Selected.has(index)) {
      Selected.delete(index);
      div.className = '';
    } else {
      Selected.add(index);
      div.className = 'selected';
    }
    console.log('Selected input_value:', item);
  });
  root.appendChild(div);
});

const parent = document.getElementById("root")

function create(value, tag = "button", placeholder) {
  const elem = document.createElement(tag);
  elem.id = value;
  elem.innerHTML = value
  if (placeholder) elem.placeholder = placeholder
  parent.appendChild(elem);
  return elem;
}

function Form(data) {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]);
  });
  return formData
}

let input_value = null
create("", "input", "user_id").oninput = (e) => {
  input_value = e.target.value
  console.log("input_value:", input_value);
}


create("login").onclick = async () => {
  for (const i of Selected) {
    console.log("log in as", users[i].username);
    await api.login(users[i]);
  }
  if (Selected.size == 0) console.error("Select at least one user");
}

/*
mhrima: "3922dafa-97b1-4af3-96a4-524bbf56102e"
ssmith: "bf16cfaa-1baf-4707-8f9b-62df094004aa"
jdoe:   "5c97be95-dc9a-4815-80f7-85e8d6cc4dcd"
ebrown: "2cfc9a0b-ce9a-445e-a983-cf010e1c76f5"
agreen: "a005400f-17a7-4f8d-bfef-50974105a3ee"
*/

create("signup").onclick = async () => {
  for (const i of Selected) {
    console.log("sign up as", users[i].username);
    await api.signup(Form(users[i]));
  }
  if (Selected.size == 0) console.error("Select at least one user");
}

create("delete user").onclick = async () => {
  for (const i of Selected) {
    console.log("log in as", users[i].username);
    await api.login(users[i]);
    await api.deleteUser();
  }
  if (Selected.size == 0) console.error("Select at least one user");
}

let user = null;
create("get user").onclick = async () => {
  user = await api.getUser();
  console.log(user);
}


create("log ids").onclick = () => {
  console.log(ids);
}

create("get friends").onclick = async () => {
  const res = await api.getRelations();
  console.log("getting friends", res);
}

/*
invites: sent invitations
invited: received invitations
friends: friends
blocks: blocked
*/

create("invite friend").onclick = async () => {
  console.log("invite friend:", input_value);
  const res = await api.inviteFriend(input_value)
  console.log("res:", res);
}

create("accept invitation").onclick = async () => {
  console.log("accept invitation", input_value);
  const res = await api.acceptInvitation(input_value);
  console.log("res:", res);
}

create("refuse invitation").onclick = async () => {
  console.log("refuse invitation", input_value);
  const res = await api.refuseInvitation(input_value);
  console.log("res:", res);
}

create("cancel invitation").onclick = async () => {
  console.log("cancel invitation", input_value);
  const res = await api.cancelInvitation(input_value);
  console.log("res:", res);
}

create("get user by id").onclick = async () => {
  if (!input_value || !input_value.length) console.error("check input");
  else {
    const res = await api.getUsersById([input_value])
    console.log(res);
  }
}

create("init soket").onclick = (e) => {
  try {
    console.log("click init socket");
    api.getSocket()
  } catch (error) {
    api.handleError(error)
  }
}

let receiver_id = ""
create("", "input", "receiver id").oninput = (e) => {
  try {
    receiver_id = e.target.value
    console.log("receiver:", receiver_id);
    
  } catch (error) {
    api.handleError(error)
  }
}

let message = "";
create("", "input", "text message").oninput = (e) => {
  message = e.target.value
  console.log("message:", message);
}

create("Send Message").onclick = async () => {
  try {
    console.log("click send message");
    api.sendMessage(receiver_id, message)
  } catch (error) {
    api.handleError(error)
  }
};


create("Retrieve Messages").onclick = async () => {
  try {
    console.log("click retrieve messages");
    api.getMessages(receiver_id)
  } catch (error) {
    api.handleError(error)
  }
}

create("Create Game").onclick = async () => {
  try{
    const new_game = await api.createGame();
    console.log("The game is: ", new_game)
  } catch(error)
  {
    api.handleError(error)
  }
}

let game_lobby_socket = null;
let game_id = null;
let enemy_id = null;
let game_invite_id = null;
const websocketApi = "http://localhost:8001";

create("", "input", "Game Id").oninput = (e) => {
  game_id = e.target.value;
}

create("Join Game Lobby").onclick= (e) => {
  try
  {
    game_lobby_socket = new WebSocket(`${websocketApi}/ws/game/${game_id}/`);
    game_lobby_socket.addEventListener('open', (e) => {
      console.log("Connected to game Lobby");
    });
  
    game_lobby_socket.addEventListener("message", (e) => {
      console.log("Game Lobby message: ", e.data)
    })
  
    game_lobby_socket.addEventListener('close', (e) => {
      console.log("Game Lobby quit");
      game_lobby_socket = undefined;
    })
  }
  catch (error)
  {
    api.handleError(error)
  }
}

create("", "input", "Enemy player").oninput = (e) => {
  enemy_id = e.target.value
}

create("Invite Enemy Player").onclick = async (e) => {
  if (!enemy_id || !game_id)
    return console.error("No enemy to invite or WebSocket Active");
  try {
    const game_invite = await api.invitePlayer(game_id, enemy_id);
  } catch (error)
  {
    api.handleError(error);
  }
}

create("", "input", "Game Invite Id").oninput = (e) => {
  game_invite_id = e.target.value;
}

create("Accept Game Invite").onclick = async (e) => {
  try {
    const accepted_game_invite = api.acceptGameInvite(game_invite_id)
  }catch (error)
  {
    api.handleError(error);
  }
}

create("Refuse Game Invite").onclick = async (e) => {
  try {
    const refused_game_invite = api.refuseGameInvite(game_invite_id);
  }
  catch(error)
  {
    api.handleError(error)
  }
}

create("Cancel Game Invite").onclick = async (e) => {
  try {
    const canceled_game_invite = api.cancelGameInvite(game_invite_id);
  } catch(error){
    api.handleError(error)
  }
}

create("Matchmaking Socket").onclick = async (e) => {
  try {
    const matchmakingSocket = api.openMatchMakingSocket()
  } catch (error)
  {
    api.handleError(error)
  }
}

create("Tournament Making Socket").onclick = async (e) => {
  try {
    const tournamentMakingSocket = api.openTournamentMakingSocket();
  } catch (error)
  {
    api.handleError(error)
  }
}