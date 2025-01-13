import Ura from 'ura';
import api from '../../../services/api.js';
import Chat from '../../../components/icons/Chat/Chat.js';
import Play from '../../../components/icons/Play/Play.js';
import Accept from '../../../components/icons/Accept/Accept.js';

function Relations() {
  const [render, State, ForceState] = Ura.init();
  const [getData, setData] = ForceState([])
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

  const handleEvent = (type) => {
    switch (type) {
      case "invited": {
        setEvents({
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
        })
        break;
      }
      case "invites": { // sent invitations
        setEvents({
          cancel: async (e) => {
            await api.cancelInvitation(e.invite_id)
            setData(await api.getInvites());
          }
        })
        break;
      }
      case "blocks": {
        setEvents({
          unblock: async (e) => {
            console.log("unblock", e)
            await api.unblockUser(e.invite_id);
            setData(await api.getBlocks())
          }
        })
        break;
      }
      case "friends": {
        setEvents({
          play: (e) => { console.log("play", e) },
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
        })
        break;
      }
      default:
        break;
    }
  }

  const fetchRelations = async (type) => {
    console.log("fetch ", type);
    try {
      switch (type) {
        case "invited": { // received invitations
          setData(await api.getInvited());
          break;
        }
        case "invites": { // sent invitations
          setData(await api.getInvites());
          break;
        }
        case "blocks": {
          setData(await api.getBlocks())
          break;
        }
        case "friends": {
          setData(await api.getFriends())
          break;
        }
        default:
          break;
      }
      handleEvent(type)

    } catch (error) {
      api.handleError(error)
    }
  }


  const handleSelect = async (e) => {
    e.preventDefault();
    try {
      // console.log(e.target.value);
      await fetchRelations(e.target.value)
    } catch (error) {
      api.handleError(error)
    }
  }

  fetchRelations("friends");

  return render(() => (
    <div id="friends">
      <select name="select" className="select" onchange={handleSelect}>
        <option value="friends">Friends</option>
        <option value="invites">Sent Invitations</option>
        <option value="invited">Received Invitations</option>
        <option value="blocks">Blocked Users</option>
      </select>

      <loop className="inner" on={getData()}>
        {(parent, i) => (
          <div className="card" key={i}>
            <div className="content">
              <div className="up">
                <img src={`${api.endpoint}${parent.profile_picture}`}
                  onclick={() => Ura.navigate(`/friend?id=${parent.id}`)} />
                <h4>{parent.username}</h4>
              </div>
              <loop on={Object.keys(getEvents())} className="down">
                {(key) => {
                  // console.log("key", key);
                  return <span onclick={() => getEvents()[key](parent)} name={key} >{Icons[key]()}</span>
                }}
              </loop>
            </div>
          </div>
        )}
      </loop>
    </div>
  ));
}

export default Relations;
