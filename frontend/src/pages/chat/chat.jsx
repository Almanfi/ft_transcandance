import Ura from "ura";
import Navbar from "../../components/Navbar.js";
import api from "../../services/api.js";
import events from "../../services/events.js";
import { navigate } from "../../ura/code.js";

const [render, State] = Ura.init();

const [getFriends, setFriends] = State([]);
const [getConv, setConv] = State([]);
const [getMe, setMe] = State({ id: -1 });
const [getUser, setUser] = State({});

const handleMessages = async () => {
  try {
    setMe(await api.getUser());

    const friends = await api.getFriends();
    setFriends(friends.map(({ id, profile_picture, status, username }) => ({ id, profile_picture, status, username })));

    const { id } = Ura.getQueries() || {};
    if (id) {
      const friend_id = id;
      const index = getFriends().findIndex(e => e.id === friend_id);
      if (index >= 0) {
        setUser(friends[index]);
        await api.retrieveMessages(friend_id);
      }
    }
    // Ura.refresh();
  } catch (err) {
    api.handleError(err);
  }
};

events.add("chat.message.retrieve", (param) => {
  if (!Ura.In("/chat")) return
  console.error("chat.message.retrieve: ", param);

  let data = param[0];
  data.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  setConv(data.messages.map((e) =>
    ({ id: e.sender.id, username: e.sender.username, content: e.content })));
});

events.add("chat.message", (param) => {
  if (!Ura.In("/chat")) return
  let data = param[0];
  if (data.status === "sent") { // sent
    const res = {
      id: getMe().id,
      username: getMe().username,
      content: data.message
    }
    setConv([...getConv(), res])
  }
  else { // received
    const res = {
      id: getUser().id,
      username: getUser().username,
      content: data.message
    }
    setConv([...getConv(), res])
  }
});

// send message
const sendMessage = () => {
  const textarea = document.querySelector(".right .down textarea");
  if (textarea.value.length) {
    api.sendMessage(getUser().id, textarea.value);
    textarea.value = "";
  }
};

const SelectConv = (e, i) => {
  Ura.setQuery("id", e.id)
  handleMessages();
};

const BlockUser = async (user) => {
  try {
    console.log("block", user);
    await api.blockUser(user.id);
    Ura.navigate("/user");
  } catch (error) {
    api.handleError(error)
  }
}

const PlayGamee = async (user) => {
  try {
    const game = await api.createGame();
    const res = await api.invitePlayer(game.id, user.id);
    const game_socket = api.openGameSocket(game['id'])
    game_socket.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data['type'] === "game.start") {
        Ura.navigate("/pong");
        events.emit("setPongData", data, "remote");
      }
    }
  } catch (error) {
    api.handleError(error)
  }
}

function Chat() {
  handleMessages();

  return render(() => (
    <root>
      <Navbar />
      <div className="chat">
        <div className="left">
          <div className="up">
            <h4>Friends</h4>
          </div>
          <div className="down" loop={getFriends()}>
            {/* friends to start chat with */}
            {(e, i) => (
              <div onclick={() => SelectConv(e, i)} className={`${e.id === getUser().id ? "selected" : ""}`}>
                <h4>{e.username}</h4>
              </div>
            )}
          </div>
        </div>

        <div className="right">
          {/* conversation */}
          <div className="title">
            <h4 onclick={() => PlayGamee(getUser())}>Play game</h4>
            <h4 onclick={() => BlockUser(getUser())}>Block</h4>
          </div>
          <div className="up" loop={getConv()} id="conversation">
            {(e) => (
              <div className={e.id === getMe().id ? "mine" : "other"} onclick={() => {
                if (e.id === getMe().id) navigate(`/user`)
                else navigate(`/friend?id=${e.id}`)
              }}>
                <p>
                  <l>{e.id === getMe().id ? `me` : e.username}</l>: {e.content}
                </p>
              </div>
            )}
          </div>
          {/* send message */}
          <div if={getUser().id} className="if">
            <div className="down">
              <textarea name="" id=""></textarea>
              <button onclick={sendMessage}>{">"}</button>
            </div>
          </div>
        </div>
      </div>
      <exec call={() => {
        const conversation = document.getElementById("conversation");
        if (conversation) conversation.scrollTop = conversation.scrollHeight;
      }} />
    </root>
  ));
}

export default Chat;
