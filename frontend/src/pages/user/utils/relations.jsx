import Ura, { navigate } from 'ura';
import api from '../../../services/api.js';
import Chat from '../../../components/icons/Chat.js';
import Play from '../../../components/icons/Play.js';
import events from '../../../services/events.js';

const [render, State, ForceState] = Ura.init();
const [getSelect, setSelect] = ForceState("friends")
const [getData, setData] = State([])
const [getEvents, setEvents] = State({})

function Relations() {

  const Icons = {
    accept: "accept",
    refuse: "refuse",
    cancel: "cancel",
    unblock: "unblock",
    block: "block",
    chat: "chat",
    play: "play",
    unfriend: "unfriend",
  }

  const eventHandlers = {
    invited: {
      accept: async (e) => {
        try {
          console.log("accept ", e.invite_id)
          await api.acceptInvitation(e.invite_id);
          setData(await api.getInvited());
        } catch (error) {
          api.handleError(error)
        }
        fetchRelations(getSelect());
        // events.emitChildren("friendship")
      },
      refuse: async (e) => {
        try {
          console.log("refuse ", e.invite_id)
          await api.refuseInvitation(e.invite_id);
          setData(await api.getInvited());
        } catch (error) {
          api.handleError(error)
        }
        fetchRelations(getSelect());
        // events.emitChildren("friendship")
      },
    },
    invites: {
      cancel: async (e) => {
        try {
          await api.cancelInvitation(e.invite_id)
          setData(await api.getInvites());
        } catch (error) {
          api.handleError(error)
        }
        fetchRelations(getSelect());
        // events.emitChildren("friendship")
      }
    },
    blocks: {
      unblock: async (e) => {
        try {
          console.log("unblock", e)
          await api.unblockUser(e.invite_id);
          setData(await api.getBlocks())
        } catch (error) {
          api.handleError(error)
        }
        fetchRelations(getSelect());
        // events.emitChildren("friendship")
      }
    },
    friends: {
      play: async (e) => {
        try {
          const game = await api.createGame();
          const res = await api.invitePlayer(game.id, e.id);
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
        fetchRelations(getSelect());
        // events.emitChildren("friendship")
      },
      chat: (e) => {
        console.log("chat", e)
        navigate(`/chat?id=${e.id}`);
      },
      block: async (e) => {
        try {
          console.log("block", e);
          await api.blockUser(e.id);
          setData(await api.getFriends())
        } catch (error) {
          api.handleError(error)
        }
        fetchRelations(getSelect());
        // events.emitChildren("friendship")
      },
      unfriend: async (e) => {
        try {
          console.log("accept ", e.invite_id)
          await api.unFriend(e.invite_id);
          setData(await api.getFriends())
        } catch (error) {
          api.handleError(error)
        }
        fetchRelations(getSelect());
        // events.emitChildren("friendship")
      },
    },
  };

  const fetchData = async (type) => {
    switch (type) {
      case "invited": return await api.getInvited();
      case "invites": return await api.getInvites();
      case "blocks": return await api.getBlocks();
      case "friends": return await api.getFriends();
      default: throw new Error("Invalid type");
    }
  };

  const fetchRelations = async (type) => {
    try {
      console.log("fetch for type", type);

      const data = await fetchData(type);
      setData(data);
      console.log("new data:", getData());

      setEvents(eventHandlers[type] || {});
    } catch (error) {
      api.handleError(error);
    }
  };

  const handleSelect = async (e) => {
    e.preventDefault();
    setSelect(e.target.value);
    // document.getElementsByClassName(".select").value = getSelect();
    await fetchRelations(e.target.value);
  };

  const handlefetch = async () => {
    await fetchRelations(getSelect());
  }

  handlefetch();

  events.addChild("friendship_received", "Relations.fetchRelations", handlefetch)
  events.addChild("friendship_accepted", "Relations.fetchRelations", handlefetch)

  return render(() => (
    <div id="friends">
      <select name="select" className="select" onchange={handleSelect} >
        <option value="friends">Friends</option>
        <option value="invites" >Sent Invitations</option>
        <option value="invited">Received Invitations</option>
        <option value="blocks">Blocked Users</option>
      </select>

      <div className="inner" loop={getData()}>
        {(parent, i) => (
          <div className="card" key={i}>
            <div className="content">
              <div className="up">
                <img
                  src={`${api.endpoint}${parent.profile_picture}`}
                  onclick={() => navigate(`/friend?id=${parent.id}`)}
                />
                <h4>{parent.username}</h4>
              </div>
              <div loop={Object.keys(getEvents())} className="down">
                {(key) => (
                  <span name={key} onclick={() => {
                    try {
                      getEvents()[key](parent)
                    } catch (error) {
                      api.handleError(error)
                    }
                    fetchRelations(getSelect());
                  }}>
                    {typeof Icons[key] === "string" ? Icons[key] : Icons[key]()}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  ));
}

export default Relations;
