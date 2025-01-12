import {Login} from './utils.js';
const websocketApi = "http://localhost:8001"


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
const matchmaking_user_id = document.createElement("input");
matchmaking_user_id.type = "number";
matchmaking_user_id.defaultValue = 0;
parent.append(matchmaking_user_id);
const tournament_id = document.createElement("input");
tournament_id.type = "text";
tournament_id.defaultValue = "uuid";
parent.append(tournament_id);

let players_tile = [];
players_tile.push(document.getElementById("t_player_1"));
players_tile.push(document.getElementById("t_player_2"));
players_tile.push(document.getElementById("t_player_3"));
players_tile.push(document.getElementById("t_player_4"));
players_tile.push(document.getElementById("t_player_5"));
players_tile.push(document.getElementById("t_player_6"));

let tournamentmaking_socket = undefined;
let tournamentlobby_socket = undefined;

function create(value) {
	const elem = document.createElement("button");
	elem.id = value;
	elem.innerHTML = value;
	parent.appendChild(elem);
	return elem;
}

create("Enter Tournament Making").onclick = async () => {
	await Login(users[matchmaking_user_id.value])
	tournamentmaking_socket = new WebSocket(`${websocketApi}/ws/tournamentmaking/`);
	tournamentmaking_socket.addEventListener("open", (e) => {
		console.log("Entered Tournament Making")
	})
	tournamentmaking_socket.addEventListener("message", async (e) => {
		console.log("Received event from tournament Making: ", e.data);
		const data = JSON.parse(e.data);
		if (data['type'] === "tournament.found")
			await load_tournament_lobby(data['tournament_id']);
	})
	tournamentmaking_socket.addEventListener("close", (e) => {
		console.log("Exited Tournament Making");
	})
}

create("Connect to Tournament").onclick = async () => {
	await Login(users[matchmaking_user_id.value]);
	load_tournament_lobby(tournament_id.value)
}

async function load_tournament_lobby(tournament_id)
{
	tournamentlobby_socket = new WebSocket(`${websocketApi}/ws/tournament/${tournament_id}/`);
	tournamentlobby_socket.addEventListener("open", () => { 
		console.log("Entered Tournament Lobby Socket");
	})
	tournamentlobby_socket.addEventListener("message", (e) => {
		console.log("Received event from Tournament Lobby: ", e.data);
		const data = JSON.parse(e.data);
		if (data["type"] === "lobby.matches")
		{
			let i = 0;
			for (const match of data['matches'])
			{
				players_tile[i].innerText = match["inviter"]['display_name'];
				players_tile[i].player_id = match['inviter']['id'];
				players_tile[i + 1].innerText = match["invited"]['display_name'];
				players_tile[i + 1].player_id = match['invited']['id'];
				i += 2;
			}
		}
		if (data['type'] === 'lobby.ready')
		{
			for (const player of players_tile)
			{
				if (player.player_id == data['player_id'])
				{
					player.innerText = player.innerText + " is Ready";
					break;
				}
			}
		}
		if (data['type'] === 'lobby.unready')
		{
			for (const player of players_tile)
			{
				if (player.player_id == data['player_id'])
				{
					player.innerText = player.innerText.split("is Ready")[0];
					break;
				}
			}
		}
	})
	tournamentlobby_socket.addEventListener("close", (e) => {
		console.log("Exited Tournament Lobby");
	});
}

create("Player Ready").onclick = async () => {
	tournamentlobby_socket.send(JSON.stringify({"type": "tournament.ready"}))
}

create("Player UnReady").onclick = async () => {
	tournamentlobby_socket.send(JSON.stringify({"type": "tournament.unready"}))
}
