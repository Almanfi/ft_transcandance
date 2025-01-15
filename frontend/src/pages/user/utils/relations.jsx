import Ura from 'ura';
import api from '../../../services/api.jsx';
import Chat from '../../../components/icons/Chat.jsx';
import Play from '../../../components/icons/Play.jsx';
import Accept from '../../../components/icons/Accept.jsx';
import events from '../../../services/events.js';

const [render, State, ForceState] = Ura.init();
const [getSelect, setSelect] = ForceState("friends")
const [getData, setData] = State([])

function Relations() {
  const [getEvents, setEvents] = State({})

  const Icons = {
    accept: () => "accept",
    refuse: () => "refuse",
    cancel: () => "cancel",
    unblock: () => "unblock",
    block: () => "block",
    chat: () => "chat",
    play: () => "play",
    unfriend: () => "unfriend",
  }

  const eventHandlers = {
    invited: {
      accept: async (e) => {
        console.log("accept ", e.invite_id)
        await api.acceptInvitation(e.invite_id);
        setData(await api.getInvited());
      },
      refuse: async (e) => {
        console.log("refuse ", e.invite_id)
        await api.refuseInvitation(e.invite_id);
        setData(await api.getInvited());
      },
    },
    invites: {
      cancel: async (e) => {
        await api.cancelInvitation(e.invite_id)
        setData(await api.getInvites());
      }
    },
    blocks: {
      unblock: async (e) => {
        console.log("unblock", e)
        await api.unblockUser(e.invite_id);
        setData(await api.getBlocks())
      }
    },
    friends: {
      play: async (e) => {
        try {
          const game = await api.createGame();
          const res = await api.invitePlayer(game.id, e.id);
          Ura.navigate(`/game?id=${game.id}`)
        } catch (error) {
          api.handleError(error)
        }
      },
      chat: (e) => {
        console.log("chat", e)
        Ura.navigate(`/chat?id=${e.id}`);
      },
      block: async (e) => {
        console.log("block", e);
        await api.blockUser(e.id);
        setData(await api.getFriends())
      },
      unfriend: async (e) => {
        console.log("accept ", e.invite_id)
        await api.unFriend(e.invite_id);
        setData(await api.getFriends())
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
    try {
      await fetchRelations(getSelect());
    } catch (error) {
      api.handleError(error);
    }
  }

  handlefetch();

  events.addChild("friendship_received", "fetchRelations", handlefetch)

  return render(() => (
    <div id="friends">
      <select name="select" className="select" onchange={handleSelect} >
        <option value="friends">Friends</option>
        <option value="invites" >Sent Invitations</option>
        <option value="invited">Received Invitations</option>
        <option value="blocks">Blocked Users</option>
      </select>

      <loop className="inner" on={getData()}>
        {(parent, i) => (
          <div className="card" key={i}>
            <div className="content">
              <div className="up">
                <img
                  src={`${api.endpoint}${parent.profile_picture}`}
                  onclick={() => Ura.navigate(`/friend?id=${parent.id}`)}
                />
                <h4>{parent.username}</h4>
              </div>
              <loop on={Object.keys(getEvents())} className="down">
                {(key) => (
                  <span onclick={() => getEvents()[key](parent)} name={key}>
                    {Icons[key]()}
                  </span>
                )}
              </loop>
            </div>
          </div>
        )}
      </loop>
    </div>
  ));
}

export default Relations;
