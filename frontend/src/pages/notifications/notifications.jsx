import Ura from 'ura';
import Navbar from '../../components/Navbar.js';
import api from '../../services/api.js';
import events from '../../services/events.js';
import Toast from '../../components/Toast.js';


const [render, State, ForceState, WeakState] = Ura.init();
const [getList, setList] = WeakState([]);

const NewFriendInvitation = async () => {
  if (!Ura.In("/notifications")) return
  try {
    const recieved = await api.getInvited();
    console.log("call update handler", recieved);

    setList(recieved.map(e => ({
      type: "friendship",
      content: `friendship request from ${e.display_name}`,
      accept: async () => {
        try { await api.acceptInvitation(e.invite_id) }
        catch (error) { api.handleError(error) }
        Ura.refresh();
      },
      refuse: async () => {
        try { await api.refuseInvitation(e.invite_id) }
        catch (error) { api.handleError(error) }
        Ura.refresh();
      }
    })))
  } catch (error) {
    api.handleError(error)
  }
};

const NewMessage = async (param) => {
  let data = param[0];
  if (data.status === 'sent') { }
  else {
    try {
      const user = await api.getUsersById([data.from]);
      
      if (Ura.In("/notifications")) {
        console.error("heloooooooo");
        const isTrue = getList().some((e) => e.type === "message" && e.content === `New message from ${user[0].display_name}`);
        if (!isTrue) {
          setList([...getList(),
          {
            type: "message",
            content: `New message from ${user[0].display_name}`,
            accept: () => {
              Ura.navigate(`/chat?id=${user[0].id}`)
              window.location.reload();
            },
            refuse: null,
          },
          ]);
        }
        Ura.refresh();
      }
      else if (!Ura.In("/chat")) {
        Ura.create(<Toast message={`${user[0].display_name} did send a message`} color="green" />);
      }
    } catch (error) {
      api.handleError(error)
    }

  }
}

let index = 1;
const NewGameInvitation = async (param) => {
  console.log("new game invite received:", param);

  const data = param[0]; // Extract data from param
  setList([
    ...getList(),
    {
      type: "game invitation",
      content: `New game invitation from ${data.invite.inviter.display_name}`,
      index: index++, // Assign a unique index
      accept: async () => {
        
        try {
          console.log("Accept game:", data);
          await api.acceptGameInvite(data.invite.id);
          const game_socket = api.openGameSocket(data.invite.game.id);
          game_socket.onmessage = (e) => {
          console.log("game message", e);
            const info = JSON.parse(e.data);
            if (info.type === "game.start") {
              Ura.navigate("/pong");
              events.emit("setPongData", info, "remote");
            }
          };
        } catch (error) {
          api.handleError(error);
        }
      },
      refuse: async () => {
        try {
          await api.refuseGameInvite(data.invite.id);
          removeNotification(index - 1); // Remove notification after refusing
          Ura.refresh();
        } catch (error) {
          api.handleError(error);
        }
      },
    },
  ]);

  Ura.refresh();
};

// Utility function to remove a notification by index
const removeNotification = (notificationIndex) => {
  const updatedList = getList().filter((item) => item.index !== notificationIndex);
  setList(updatedList);
};

events.addChild("friendship_received", "Notifications.NewFriendInvitation", NewFriendInvitation);
events.addChild("chat.message", "Notifications.NewMessage", NewMessage);
events.addChild("game_invite", "Notifications.NewGame", NewGameInvitation);

function Notifications() {

  return render(() => (
    <root>
      <Navbar />
      <h3>
        Notifications [{getList().length}]
      </h3>
      <div loop={getList()} className="notifications">
        {(e) => (
          <div className="data">
            <span className="title">
              <h4>{e.content}</h4>
            </span>
            <span className="action">
              <h4 if={e.accept} className="accept" onclick={e.accept}> 
              </h4>
              <h4 if={e.refuse} className="refuse" onclick={e.refuse}>
              </h4>
            </span>
          </div>
        )}
      </div>
    </root>
  ));
}

export default Notifications;
