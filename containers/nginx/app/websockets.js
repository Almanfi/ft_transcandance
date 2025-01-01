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

	socket.addEventListener('open', (event) => {
		console.log('WebSocket connection established.');
		// Send a message to the server
	});

	socket.addEventListener('message', (event) => {
		console.log('Message from server:', event.data);
	});

	socket.addEventListener('close', (event) => {
		console.log('WebSocket connection closed:', event);
	});

	socket.addEventListener('error', (event) => {
		console.error('WebSocket error:', event);
	});
}