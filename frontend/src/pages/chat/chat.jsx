import Ura from "ura";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

function Chat(props = {}) {
  const [render, State] = Ura.init();

  const [getFriends, setFriends] = State([]);
  const [getConv, setConv] = State([]);
  const [getCurr, setCurr] = State({});
  const [getUser, setUser] = State({});

  // api.setEvent("chat.message.retrieve", (data) => {
  //   console.log("chat.message.retrieve", data.messages);
  //   data.messages.sort((a, b) => {
  //     return new Date(a.timestamp) - new Date(b.timestamp);
  //   });
  //   const res = data.messages.map((e) => ({ id: e.sender.id, username: e.sender.username, content: e.content }))
  //   setConv(res);
  // });

  const handleMessages = async () => {
    try {
      const { id: friend_id } = Ura.getQueries() || {};
      const friends = await api.getFriends();
      setFriends(friends.map(({ id, profile_picture, status, username }) => ({ id, profile_picture, status, username })));
      const index = getFriends().findIndex(e => e.id === friend_id);
      if (index >= 0) {
        setCurr(friends[index]);
        await api.retrieveMessages(friend_id);
      }
    } catch (err) {
      api.handleError(err);
    }
  };
  handleMessages();

  // retrieve messages
  const SelectConv = (e, i) => {
    console.log("select", i, "has id", e.id);
    Ura.setQuery("id", e.id)
    handleMessages();
  };

  // recieve messages
  // api.setEvent("chat.message", (data) => {
  //   console.log("receive chat.message event with ", data);
  //   if (data.from === getCurr().id) {
  //     const res = {
  //       id: getCurr().id,
  //       username: getCurr().username,
  //       content: data.message
  //     }
  //     console.log("set conversation to");
  //     console.log(getConv());
  //     console.log("add to it", res);

  //     setConv([
  //       ...getConv(),
  //       res,
  //     ])
  //     // const res = data.message.map((e) => ({ id: e.sender.id, username: e.sender.username, content: e.content }))
  //   }
  // });

  const call = async () => {
    console.warn("before");
    const user = { ...await api.getUser() }
    console.warn("after", user);
    setUser(user);
  }
  call()

  const sendMessage = () => {
    const textarea = document.querySelector(".right .down textarea");
    if (textarea.value.length) {
      console.log("send", textarea.value, "to:", getCurr());
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
      <div className="chat">
        <Navbar />
        {/* <New/> */}
        <div className="left">
          <div className="up">
              <h4>Friends</h4>
          </div>
          <div className="down">
            {/* friends to start chat with */}
            <loop on={getFriends()}>
              {(e, i) => (
                <div onclick={() => SelectConv(e, i)} className={`${e.id === getCurr().id ? "selected" : ""}`}>
                  <h4>{e.username}</h4>
                </div>
              )}
            </loop>
          </div>
        </div>

        <div className="right">
          {/* conversation */}
          <div className="title">
            <h4>Play game</h4>
            <h4>Block</h4>
          </div>
          <loop on={getConv()} className="up">
            {(e) => (
              <div className={e.id === getUser().id ? "mine" : "other"}>
                <p>
                  <l>{e.username}</l>: {e.content}
                </p>
              </div>
            )}
          </loop>
          {/* send message */}
          <if cond={/*getIndex() != -1 || */true}>
            <div className="down">
              <textarea name="" id=""></textarea>
              <button onclick={sendMessage}>{">"}</button>
            </div>
          </if>
        </div>
      </div>
    </root>
  ));
}

export default Chat;
