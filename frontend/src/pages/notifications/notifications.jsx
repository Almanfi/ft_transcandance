import Ura from 'ura';
import Navbar from '../../components/Navbar.js';
import api from '../../services/api.js';
import events from '../../services/events.js';
import Toast from '../../components/Toast.js';

const [render, State] = Ura.init();
const [getList, setList] = State([]);

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
        // Ura.refresh();
      },
      refuse: async () => {
        try { await api.refuseInvitation(e.invite_id) }
        catch (error) { api.handleError(error) }
        // Ura.refresh();
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
      }
      else if (!Ura.In("/chat")) {
        Ura.create(<Toast message={`${user[0].display_name} did send a message`} color="green" />);
      }
    } catch (error) {
      api.handleError(error)
    }

  }
}
const NewGameInvitation = async () => { };

events.addChild("friendship_received", "Notifications.NewFriendInvitation", NewFriendInvitation);
events.addChild("chat.message", "Notifications.NewMessage", NewMessage);

function Notifications() {
  NewFriendInvitation()

  return render(() => (
    <root>
      <Navbar />
      <div loop={getList()} className="notifications">
        {(e) => (
          <div className="data">
            <span className="title">
              <h4>{e.content}</h4>
            </span>
            <span className="action">
              <h4 if={e.accept} className="accept" onclick={e.accept}> {">"}
              </h4>
              <h4 if={e.refuse} className="refuse" onclick={e.refuse}> {"x"}
              </h4>
            </span>
          </div>
        )}
      </div>
    </root>
  ));
}

export default Notifications;
