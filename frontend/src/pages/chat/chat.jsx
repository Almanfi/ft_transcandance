import Ura from "ura";
import Navbar from "../../components/Navbar/Navbar.js";
import { conversationGroups } from "./convs.js";
import New from "../../components/create/create.js";
import api from "../../services/api.js";

/*
+ get friends
+ list them
+ get to conversation op each one on selcting the conversation
*/

function Chat(props = {}) {
  const { id } = Ura.getQueries() || {};

  const [render, State] = Ura.init();

  const [getIndex, setIndex] = State(-1);
  const [getGroup, setGroup] = State([]);
  const [getConv, setConv] = State([]);

  const messagesCache = new Map();
  const setMessages = async (id) => {
    try {
      const friends = await api.getFriends();
      setGroup(friends.map(({ id, profile_picture, status, username }) => ({ id, profile_picture, status, username })));

      if (id) {
        if (!messagesCache.has(id)) {
          const conv = api.getMessages(id);
          messagesCache.set(id, conv);
          setConv(conv);
        } else {
          setConv(messagesCache.get(id));
        }
      }
    } catch (err) {
      api.handleError(err);
    }
  };
  setMessages(id);

  // retrieve messages
  const SelectConv = (e, i) => {
    setIndex(i);
    console.log("select", i, "has id", e.id);
    api.getMessages(e.id);
  };

  api.setEvent("chat.message.retrieve", (data) => {
    console.log(
      "receive chat.message.retrieve event with ",
      data.messages.map((e) => ({
        content: e.content,
        username: e.sender.username,
        id: e.sender.id,
      }))
    );
    setConv(
      data.messages.map((e) => ({
        content: e.content,
        username: e.sender.username,
        id: e.sender.id,
      }))
    );
  });

  // recieve messages
  const chatMessages = new Set();
  api.setEvent("chat.message", (data) => {
    console.log("receive chat.message event with ", data);

    if (!chatMessages.has(data.messageId)) {
      chatMessages.add(data.messageId);
      const index = getGroup().findIndex((e) => e.id === data.from);
      if (index !== -1) {
        setConv([
          ...getConv(),
          {
            id: data.from,
            username: getGroup()[index].username,
            content: data.message,
          },
        ]);
      } else {
        console.error("User not found.");
      }
    }
  });

  const sendMessage = () => {
    const textarea = document.querySelector(".right .down textarea");
    if (textarea.value.length && getIndex() !== -1) {
      console.log("send", textarea.value, "to:", getGroup()[getIndex()].username);

      api.sendMessage(getGroup()[getIndex()].id, textarea.value);
      setConv([
        ...getConv(),
        {
          id: Ura.store.get("id"),
          username: "You",
          content: textarea.value,
        },
      ]);
      textarea.value = "";
    }
  };

  return render(() => (
    <root>
      <div className="chat">
        <Navbar />
        {/* <New/> */}
        <div className="left">
          <div className="up">
            <div className="create-group">
              {/* create group */}
              <h4>Create Group</h4>
            </div>
          </div>
          <div className="down">
            {/* friends to start chat with */}
            <loop on={getGroup()}>
              {(e, i) => (
                <div onclick={() => SelectConv(e, i)} className={`${getIndex() === i ? "selected" : ""}`} >
                  <h4>{e.username}</h4>
                </div>
              )}
            </loop>
          </div>
        </div>

        <div className="right">
          {/* conversation */}
          <loop on={getConv()} className="up">
            {(e) => (
              <div className={e.id === Ura.store.get("id") ? "mine" : "other"}>
                <p>
                  <l>{e.username}</l>: {e.content}
                </p>
              </div>
            )}
          </loop>
          {/* send message */}
          <if cond={getIndex() != -1 || true}>
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
