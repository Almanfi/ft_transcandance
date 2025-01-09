import Ura from 'ura';

async function sendHttpRequest() {
  try {
    const res = await fetch("http://localhost:8080/abc", {});
    if (res.ok) {
      const body = await res.json();
      console.log("HTTP Response:", body);
    } else {
      const body = await res.json();
      console.error("Error in HTTP request:", body.message);
      throw body;
    }
  } catch (error) {
    console.error("HTTP Request Error:", error);
  }
}

function connectWebSocket() {
  const ws = new WebSocket("ws://localhost:8765");

  ws.onopen = () => {
    console.log("WebSocket connection established.");
    ws.send(JSON.stringify({ message: "Hello from the client!" }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("WebSocket Response:", data);
  };

  ws.onerror = (error) => {
    console.error("WebSocket Error:", error);
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed.");
  };

  return ws;
}


function Game(props = {}) {
  const [render, State] = Ura.init();
  const [getter, setter] = State(20);

  const websocket = connectWebSocket();

  const sendMessageToServer = () => {
    if (websocket.readyState === WebSocket.OPEN) {
      const value = getter();
      websocket.send(JSON.stringify({ value }));
    } else {
      console.error("WebSocket is not open.");
    }
  };

  websocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received from server:", data);
    if (data.newValue !== undefined) {
      setter(data.newValue); // Update the state with the new value from the server
    }
  };

  return render(() => (
    <div className="game">
      <h1>WebSocket Demo</h1>
      <button onclick={sendMessageToServer}>Send Value to Server</button>
      <span style={{ marginLeft: `${getter()}px` }}>abc</span>
    </div>
  ));
}

export default Game;
