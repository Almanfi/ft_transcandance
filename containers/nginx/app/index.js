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
} from "./utils.js";

import { ConnectToMessagingSocket } from "./websockets.js";
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
  document.body.appendChild(elem);
  return elem;
}

function createImg() {
  const elem = document.createElement("img");
  parent.appendChild(elem);
  return elem;
}

create("login").onclick = async () => {
  await Login(users[0]);
};

create("signup").onclick = async () => {
  await Signup(users[0]);
};

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

const a = document.createElement("a");
a.href = "/api/oauth/42/";
a.innerHTML = "go to 42 oauth";

parent.appendChild(a);

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
  socket = await ConnectToMessagingSocket();
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

function socketIsAlive()
{
	return (socket == undefined || socket.readyState === WebSocket.CLOSED);
}

create("Send Message").onclick = async () => {
  if (socketIsAlive()) return console.error("No Messaging Socket is active");
  const message = socket_message.value;
  const receiver_idx = socket_receiver.value;
  const found = await searchUser(users[receiver_idx].display_name);
  const friend_id = found[0].id;
  socket.send(JSON.stringify({ type: "chat.message", friend_id, message }));
};

create("Retrieve All Messages").onclick = async () => {
	if (socketIsAlive()) return console.error("No Messaging Socket is active");
	const receiver_idx = socket_receiver.value;
	const found = await searchUser(users[receiver_idx].display_name);
	const friend_id = found[0].id;
	socket.send(JSON.stringify({type: "chat.message.retrieve", friend_id}))
}

create("Close Messaging Socket").onclick = async () => {
	if (socketIsAlive()) return console.error("No Messaging Socket is active");
	socket.close();
}

