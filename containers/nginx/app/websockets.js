const websocketApi = "http://localhost:8001"

// export function splitCookies() {
// 	const cookies = document.cookie;
// 	let cookieObj = {}
// 	cookies.split(";").forEach((cookie) => {
// 		const [name, value] = cookie.split('=').map((c) => c.trim());
// 		if (name) {
// 			cookieObj[name] = value
// 		}
// 	})
// 	return cookieObj
// }

export async function ConnectToMessagingSocket() {
	const socket = new WebSocket(`${websocketApi}/ws/messaging/`);
	return socket;
}

export async function ConnectToCustomGameSocket(game_id) {
	const custom_game = new WebSocket(`${websocketApi}/ws/game/${game_id}/`)
}

