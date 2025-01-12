import Ura from 'ura';
import api, { getUser } from '../../../services/api.js';
import Chat from '../../../components/Chat/Chat.js';
import Play from '../../../components/Play/Play.js';
import Accept from '../../../components/Accept/Accept.js';

function Relations() {
  const [render, State, ForceState] = Ura.init();
  const [getData, setData] = ForceState([])
  const [getEvents, setEvents] = State([])

  const fetchRelations = async (type) => {
    console.log("fetch ", type);

    try {
      // const relations = await api.getRelations()
      const user = await api.getUser();
      let ids = [];
      let events = [];
      switch (type) {
        case "invited": { // received invitations
          const getInvited = async () => {
            const relations = await api.getRelations()
            const data = relations[type].map(invite => invite.from_user);
            ids = await api.getUsersById(data);
            for (const fetchedUser of ids) {
              for (const invite of relations[type]) {
                if (invite.from_user == fetchedUser.id) {
                  fetchedUser['invite_id'] = invite['id'];
                  break;
                }
              }
            }
            setData(ids)
          }
          events = [{
            name: "accept",
            handler: async (e) => {
              console.log("accept ", e.invite_id)
              await api.acceptInvitation(e.invite_id);
              await getInvited();
            },
            Icon: Accept
          },
          {
            name: "refuse",
            handler: async (e) => {
              console.log("refuse ", e.invite_id)
              await api.refuseInvitation(e.invite_id);
              await getInvited();
            },
            Icon: Play
          }]

          await getInvited();
          break;
        }
        case "invites": { // sent invitations
          const getInvites = async ( ) => {
            const relations = await api.getRelations()
            const data = relations[type].map(user => user.to_user);
            ids = await api.getUsersById(data);
            for (const fetchedUser of ids) {
              for (const invite of relations[type]) {
                if (invite.to_user == fetchedUser.id) {
                  fetchedUser['invite_id'] = invite['id'];
                  break;
                }
              }
            }
            setData(ids)
          }
          await getInvites();
          events = [{
            name: "cancel",
            handler: async (e) => { 
              await api.cancelInvitation(e.invite_id)
              await getInvites();
            },
            Icon: Chat
          }]

          break;
        }
        case "blocks": {
          const getBlocked = async () => {
            const relations = await api.getRelations()
            let data = []
            for (const invite of relations[type]) {
              if (user.id == invite.from_user) data.push(invite.to_user);
              else data.push(invite.from_user);
            }
            ids = await api.getUsersById(data);
            for (const fetchedUser of ids) {
              for (const invite of relations[type]) {
                if (invite.from_user == fetchedUser.id || invite.to_user == fetchedUser.id) {
                  console.warn("found")
                  fetchedUser['invite_id'] = invite['id'];
                  break;
                }
              }
            }
            setData(ids)
            console.log("logger:", getData());
          }
          await getBlocked()


          events = [{
            name: "unblock",
            handler: async (e) => {
              console.log("unblock", e)
              await api.unblockUser(e.invite_id);
              await getBlocked();
            },
            Icon: Chat
          }]
          break;
        }
        case "friends": {
          const getFriends = async () => {
            const relations = await api.getRelations()
            let data = []
            for (const invite of relations[type]) {
              if (user.id == invite.from_user) data.push(invite.to_user);
              else data.push(invite.from_user);
            }
            ids = await api.getUsersById(data);
            for (const fetchedUser of ids) {
              for (const invite of relations[type]) {
                if (invite.from_user == fetchedUser.id || invite.to_user == fetchedUser.id) {
                  fetchedUser['invite_id'] = invite['id'];
                  break;
                }
              }
            }
            setData(ids)
          }

          await getFriends();

          events = [{
            name: "chat",
            handler: (e) => { console.log("chat", e) },
            Icon: Chat
          },
          {
            name: "play",
            handler: (e) => { console.log("play", e) },
            Icon: Play
          },
          {
            name: "block",
            handler: async (e) => {
              console.log("block", e);
              await api.blockUser(e.id);
              await getFriends()
            },
            Icon: Chat,

          },
          {
            name: "unfriend",
            handler: async (e) => {
              console.log("accept ", e.invite_id)
              await api.unFriend(e.invite_id);
              await getFriends();
            },
            Icon: Chat
          }
          ]

          break;
        }
        default:
          break;
      }
      // console.log(type, ", relations:", relations, ", ids:", ids);
      // setData(ids)
      setEvents(events);
    } catch (error) {
      api.handleError(error)
    }
  }

  const handleSelect = async (e) => {
    e.preventDefault();
    try {
      console.log(e.target.value);
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
              <loop on={getEvents()} className="down">
                {(child) => <span onclick={() => child.handler(parent)} name={child.name} >{child.name}</span>}
              </loop>
            </div>
          </div>
        )}
      </loop>
    </div>
  ));
}

export default Relations;
