import {
  deleteUser,
  getRelations,
  getPicture,
  getUser,
  InviteFriend,
  Login,
  Signup,
  updateUser,
  acceptInvitation,
  refuseInvitation,
  cancelInvitation,
  removeFriend,
  blockUser,
  unblockUser,
  searchUser,
  createGame,
  getGameInvites, 
  invitePlayer,
  acceptGameInvite,
  refuseGameInvite,
  cancelGameInvite,
  getGame
} from "./utils.js";

let users = [
  {
    firstname: "mohammed",
    lastname: "hrima",
    username: "mhrima",
    password: "Mhrima123@@",
    display_name: "yuliy",
  },
  {
    firstname: "sara",
    lastname: "smith",
    username: "ssmith",
    password: "SaraSmith456##",
    display_name: "sara_s",
  },
  {
    firstname: "john",
    lastname: "doe",
    username: "jdoe",
    password: "JohnDoe789**",
    display_name: "johnny",
  },
  {
    firstname: "emily",
    lastname: "brown",
    username: "ebrown",
    password: "EmilyBrown101!!",
    display_name: "em_brown",
  },
];

const parent = document.getElementById("root");

function create(value) {
  const elem = document.createElement("button");
  elem.id = value;
  elem.innerHTML = value;
  parent.appendChild(elem);
  return elem;
}

function breaker(text)
{
	const elem = document.createElement("h1");
	const br = document.createElement("br");
	elem.innerHTML = text
	parent.appendChild(elem);
}

function createImg() {
  const elem = document.createElement("img");
  parent.appendChild(elem);
  return elem;
}
breaker("User Api /users/")

create("login").onclick = async () => {
  await Login(users[0]);
};

create("signup").onclick = async () => {
  await Signup(users[0]);
};

const a = document.createElement("a");
a.href = "/api/oauth/42/";
a.innerHTML = "go to 42 oauth";
parent.appendChild(a);

create("get user").onclick = async () => {
  await getUser();
};

create("search user").onclick = async () => {
  await searchUser("m");
};

const img = createImg();
create("get image").onclick = async () => {
  img.src = await getPicture();
};

create("update user").onclick = async () => {
  await updateUser({
    display_name: "abcde",
  });
};

create("delete user").onclick = async () => {
  await deleteUser();
};

create("delete all users").onclick = async () => {
  for (const user of users)
  {
	await Login(user)
	await deleteUser(user)
  }
};

create("signs all users").onclick = async () => {
  const all = await Promise.all(users.map(async (user) => await Signup(user)));
  console.log("all users:", all);
};

create("get all users").onclick = async () => {
	const all = await Promise.all(users.map(async (user) => {
		await Login(user)
		return await getUser()
	}))
	all.forEach((u, i) => {
		users[i].id = u.id
	})
	console.log("All users", users)
}

breaker("Relationships Api /relationships")

create("invite friends").onclick = async () => {
  await Login(users[0]);
  const res = await InviteFriend(users[1].id);
  console.log("adding friend", res);
};

create("get friends").onclick = async () => {
  await Login(users[0]);
  const res = await getRelations();
  console.log("getting friends", res);
};

create("accept friend").onclick = async () => {
  await Login(users[1]);
  const res = await getRelations();
  console.log("fetting relations", res);
  await Promise.all(res.invited.map(async (e) => await acceptInvitation(e.id)));
};

create("cancel invitation").onclick = async () => {
  await Login(users[0]);
  const res = await getRelations();
  console.log("fetting relations", res);
  await Promise.all(res.invites.map(async (e) => await cancelInvitation(e.id)));
};

create("refuse invitation").onclick = async () => {
  await Login(users[1]);
  const res = await getRelations();
  console.log("fetting relations", res);
  await Promise.all(res.invited.map(async (e) => await refuseInvitation(e.id)));
};

create("remove friend").onclick = async () => {
  await Login(users[0]);
  const res = await getRelations();
  console.log("fetting relations", res);
  await Promise.all(res.friends.map(async (e) => await removeFriend(e.id)));
};

create("block user").onclick = async () => {
  await Login(users[0]);
  await blockUser(users[1].id);
};

create("unblock user").onclick = async () => {
  await Login(users[0]);
  const res = await getRelations();
  console.log("fetting relations", res);
  await Promise.all(res.blocks.map(async (e) => await unblockUser(e.id)));
};

breaker("Game Api /games")

let new_game = undefined;
let game_invite = undefined;

create("New Game").onclick = async () => {
	await Login(users[0])
	new_game = await createGame()
}

create("get Invites").onclick = async () => {
	await Login(users[0])
	await getGameInvites()
}

create("Invite in Game").onclick = async () => {
	await Login(users[0])
	if (new_game === undefined)
		return console.error("No game to invite to")
	const found = await searchUser(users[1].display_name);
	console.log("the found player is: ", found)
	const invited_id = found[0]['id']
	game_invite = await invitePlayer(new_game.id, invited_id)
}

create("Cancel Game Invite").onclick = async () => {
	await Login(users[0])
	if (game_invite  === undefined)
		return console.error("No game invite to cancel");
	await cancelGameInvite(game_invite.id)
}

create("Accept Game Invite").onclick = async () => {
	await Login(users[1]);
	const invites = await getGameInvites();
	await acceptGameInvite(invites[0].id);
}

create("Refuse Game Invite").onclick = async () => {
	await Login(users[1]);
	const invites = await getGameInvites();
	await refuseGameInvite(invites[0].id);
}

breaker("Events and Messaging Socket /ws/messaging");

const websocketApi = "wss://" + window.location.hostname + ":8000";

const socket_messager = document.createElement("input");
socket_messager.type = "number";
socket_messager.defaultValue = 0;
const socket_message = document.createElement("input");
socket_message.type = "text";
socket_message.defaultValue = "Hello";
const socket_receiver = document.createElement("input");
socket_receiver.type = "number";
socket_receiver.defaultValue = 1;
parent.appendChild(socket_messager);
parent.appendChild(socket_message);
parent.appendChild(socket_receiver);
let socket = undefined;

create("Messaging Socket").onclick = async () => {
  const messager_id = socket_messager.value;
  await Login(users[messager_id]);
  socket = new WebSocket(`${websocketApi}/ws/messaging/`);;
  socket.addEventListener("open", (event) => {
    console.log("WebSocket connection established.");
  });

  socket.addEventListener("message", (event) => {
    console.log("Message from server:", event.data);
  });

  socket.addEventListener('close', (event) => {
  	console.log('WebSocket connection closed');
  });

  // socket.addEventListener('error', (event) => {
  // 	console.error('WebSocket error:', event);
  // });
};

function socketIsDead(sock)
{
	return (sock == undefined || sock.readyState === WebSocket.CLOSED);
}

create("Send Message").onclick = async () => {
  if (socketIsDead(socket)) return console.error("No Messaging Socket is active");
  const message = socket_message.value;
  const receiver_idx = socket_receiver.value;
  const found = await searchUser(users[receiver_idx].display_name);
  const friend_id = found[0].id;
  socket.send(JSON.stringify({ type: "chat.message", friend_id, message }));
};

create("Retrieve All Messages").onclick = async () => {
	if (socketIsDead(socket)) return console.error("No Messaging Socket is active");
	const receiver_idx = socket_receiver.value;
	const found = await searchUser(users[receiver_idx].display_name);
	const friend_id = found[0].id;
	socket.send(JSON.stringify({type: "chat.message.retrieve", friend_id}))
}

create("Close Messaging Socket").onclick = async () => {
	if (socketIsDead(socket)) return console.error("No Messaging Socket is active");
	socket.close();
}

breaker("Game Socket /ws/game//uuid:gam_id/")

let game_socket = undefined

const game_message = document.createElement("input");
game_message.type = "text";
game_message.defaultValue = "Hello Game";
parent.append(game_message)

const game_id = document.createElement("input");
game_id.type = "text";
game_id.defaultValue = "game_id";
parent.append(game_id)

let player_id = document.createElement("input");
player_id.type = "number";
player_id.defaultValue = 0;
parent.append(player_id)

create("Connect to Game Lobby").onclick = async () =>
{
	await Login(users[0])
	if (new_game === undefined)
		return console.error("No game to conect to")
  await Login(users[player_id.value])
	game_socket = new WebSocket(`${websocketApi}/ws/game/${game_id.value}/`);
	game_socket.addEventListener('open', (e) => {
		console.log("Connected to game Lobby");
	});

	game_socket.addEventListener("message", (e) => {
		console.log("Game Lobby message: ", e.data)
	})

	game_socket.addEventListener('close', (e) => {
		console.log("Game Lobby quit");
		game_socket = undefined;
	})
}

create("Game Lobby Move Teams").onclick = async () => {
	if (socketIsDead(game_socket)) return console.error("Not connected to a game lobby");
	game_socket.send(JSON.stringify({type:"game.move"}));
}

create("Quit Game Lobby").onclick = async () => {
	if (socketIsDead(game_socket)) return console.error("Not connected to a game lobby");
	game_socket.send(JSON.stringify({type: "game.quit"}));
}

create("Start Game").onclick = async () => {
	if (socketIsDead(game_socket)) return console.error("Not connected to a game lobby");
	game_socket.send(JSON.stringify({type: "game.start"}))
}

create("Cancel Game").onclick = async () => {
	if (socketIsDead(game_socket)) return console.error("Not connected to a game lobby");
	game_socket.send(JSON.stringify({type: "game.cancel"}))
}

create("Game Lobby message").onclick = async () => {
	if (socketIsDead(game_socket)) return console.error("Not connected to a game lobby");
	game_socket.send(JSON.stringify({type:"game.message", message:game_message.value}))
}

create("Game Lobby Retrieve Messages").onclick = async () => {
	if (socketIsDead(game_socket)) return console.error("Not connected to a game lobby");
	game_socket.send(JSON.stringify({type: "game.retrieve_messages"}))
}



create("Fetch game").onclick = async () => {
  const game = await getGame(game_id.value);
}

breaker("Matchmaking /ws/matchmaking/")

const matchmaking_user_id = document.createElement("input");
matchmaking_user_id.type = "number";
matchmaking_user_id.defaultValue = 0;
parent.append(matchmaking_user_id)

let matchmaking_socket = undefined;

create("Enter MatchMaking").onclick = async () => {
	// console.log(users[matchmaking_user_id])
	await Login(users[matchmaking_user_id.value])
	matchmaking_socket = new WebSocket(`${websocketApi}/ws/matchmaking/`);
	matchmaking_socket.addEventListener("open", (e) => {
		console.log("Entered Matchmaking");
	});
	matchmaking_socket.addEventListener("message", (e) => {
		console.log("Received event from matchmaking: ", e.data);
	});
	matchmaking_socket.addEventListener("close", (e) => {
		console.log("Exited Matchmaking");
	});
}

breaker("Tournament Making /ws/tournamentmaking/")

let tournamentmaking_socket = undefined;
let tournament_id = undefined

create("Enter Tournament Making").onclick = async () => {
	await Login(users[matchmaking_user_id.value])
	tournamentmaking_socket = new WebSocket(`${websocketApi}/ws/tournamentmaking/`);
	tournamentmaking_socket.addEventListener("open", (e) => {
		console.log("Entered Tournament Making")
	})
	tournamentmaking_socket.addEventListener("message", (e) => {
		console.log("Received event from tournament Making: ", e.data);
		const data = JSON.parse(e.data);
		if (data['type'] === "tournament.found")
			tournament_id = data['tournament_id'];
	})
	tournamentmaking_socket.addEventListener("close", (e) => {
		console.log("Exited Tournament Making");
	})
}

breaker("Tournament Socket /ws/tournament/<uuid:tournament_id>/");

let tournamentlobby_socket = undefined;

create("Enter Tournament Lobby").onclick = async () => {
	if (tournament_id === undefined) return console.error("No Tournament Id given");
	tournamentlobby_socket = new WebSocket(`${websocketApi}/ws/tournament/${tournament_id}/`);
	tournamentlobby_socket.addEventListener("open", () => { 
		console.log("Entered Tournament Lobby Socket");
	})
	tournamentlobby_socket.addEventListener("message", (e) => {
		console.log("Received event from Tournament Lobby: ", e.data);
	})
	tournamentlobby_socket.addEventListener("close", (e) => {
		console.log("Exited Tournament Lobby");
	});
}

create("Tournament Lobby participants").onclick = async () => {
	if (socketIsDead(tournamentlobby_socket)) return console.error("No Tournament Socket Lobby Alive");
	tournamentlobby_socket.send(JSON.stringify({type:"tournament.lobby"}))
}

create("Tournament Lobby Ready").onclick = async () => {
	if (socketIsDead(tournamentlobby_socket)) return console.error("No Tournament Socket Lobby Alive");
	tournamentlobby_socket.send(JSON.stringify({type: "tournament.ready"}))
}

create("Tournament Lobby Unready").onclick = async () => {
	if (socketIsDead(tournamentlobby_socket)) return console.error("No Tournament Socket Lobby Alive");
	tournamentlobby_socket.send(JSON.stringify({type: "tournament.unready"}))
}
