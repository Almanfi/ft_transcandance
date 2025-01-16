import Ura from "ura";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.jsx";
import events from "../../services/events.js";
import { navigate } from "../../ura/code.js";

const [render, State] = Ura.init();

const [getFriends, setFriends] = State([]);
const [getConv, setConv] = State([]);
const [getCurr, setCurr] = State({ id: -1 });
const [getUser, setUser] = State({});

const handleMessages = async () => {
  try {
    const friends = await api.getFriends();
    setFriends(friends.map(({ id, profile_picture, status, username }) => ({ id, profile_picture, status, username })));

    const { id } = Ura.getQueries() || {};
    if (id) {
      const friend_id = id;
      const index = getFriends().findIndex(e => e.id === friend_id);
      if (index >= 0) {
        setCurr(friends[index]);
        await api.retrieveMessages(friend_id);
      }
    }
  } catch (err) {
    api.handleError(err);
  }
};

events.add("chat.message.retrieve", (param) => {
  if (!Ura.In("/chat")) return

  console.error("chat.message.retrieve: ", param);
  let data = param[0];
  data.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const res = data.messages.map((e) => ({ id: e.sender.id, username: e.sender.username, content: e.content }))
  setConv(res);
});

events.add("chat.message", (param) => {
  if (!Ura.In("/chat")) return

  console.error("chat.message: ", param);
  // let data = param[0];
  // if (data.from === getCurr().id) {
  //   // const res = {
  //   //   id: getCurr().id,
  //   //   username: getCurr().username,
  //   //   content: data.message
  //   // }
  //   // console.log("set conversation to");
  //   // console.log(getConv());
  //   // console.log("add to it", res);

  //   // setConv([
  //   //   ...getConv(),
  //   //   res,
  //   // ])
  // }
  handleMessages()
});


function Chat() {
  setCurr({ ...getCurr(), id: -1 })
  handleMessages();
  api.openSocket();

  (async () => {
    const user = { ...await api.getUser() }
    setUser(user);
  })()

  // retrieve messages
  const SelectConv = (e, i) => {
    Ura.setQuery("id", e.id)
    handleMessages();
  };

  const sendMessage = () => {
    const textarea = document.querySelector(".right .down textarea");
    if (textarea.value.length) {
      // console.log("send", textarea.value, "to:", getCurr());
      api.sendMessage(getCurr().id, textarea.value);
      const res = {
        id: getUser().id,
        username: getUser().username,
        content: textarea.value
      }
      textarea.value = "";
      setConv([
        ...getConv(),
        res,
      ])
    }
  };

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
              <div onclick={() => SelectConv(e, i)} className={`${e.id === getCurr().id ? "selected" : ""}`}>
                <h4>{e.username}</h4>
              </div>
            )}
          </div>
        </div>

        <div className="right">
          {/* conversation */}
          <div className="title">
            <h4>Play game</h4>
            <h4>Block</h4>
          </div>
          <div className="up" loop={getConv()} id="conversation">
            {(e) => (
              <div className={e.id === getUser().id ? "mine" : "other"} onclick={() => {
                if (e.id === getUser().id) navigate(`/user`)
                else navigate(`/friend?id=${e.id}`)
              }}>
                <p>
                  <l>{e.id === getUser().id ? "me" : e.username}</l>: {e.content}
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
