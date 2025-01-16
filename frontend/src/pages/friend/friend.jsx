import Ura from 'ura';
import Navbar from '../../components/Navbar.jsx';
import Swords from '../../components/icons/Swords.jsx';
import WinCup from '../../components/icons/WinCup.jsx';
import Award from '../../components/icons/Award.jsx';
import Play from '../../components/icons/Play.jsx';
import Chat from '../../components/icons/Chat.jsx';
import api from '../../services/api.jsx';
import Toast from '../../components/Toast.jsx';
import events from '../../services/events.js';
// import { GlobalUser } from '../../services/store.js';

// const [getGlobalUser, setGlobalUser] = GlobalUser;
// TODO: check if id is not for current user
const [render, State] = Ura.init();


const [getUser, setFriendData] = State({
  id: "",
  firstname: "",
  lastname: "",
  display_name: "",
  profile_picture: "/static/rest/images/users_profiles/profile.jpg"
});


const determineAction = async (id) => {
  const [friends, invited, invites, blocks] = await Promise.all([
    api.getFriends(),
    api.getInvited(),
    api.getInvites(),
    api.getBlocks(),
  ]);

  const findUser = (users) => users.find(user => user.id === id);
  const blockedUser = findUser(blocks);
  if (blockedUser) return { invite_id: blockedUser.invite_id, action: "Blocked user" };
  const friend = findUser(friends);
  if (friend) return { invite_id: friend.invite_id, action: "Start conversation" };
  const invitedUser = findUser(invited);
  if (invitedUser) return { invite_id: invitedUser.invite_id, action: "Accept invitation" };
  const invite = findUser(invites);
  if (invite) return { invite_id: invite.invite_id, action: "Cancel invitation" };
  return { invite_id: null, action: "Send invitation" };
};

const [getAction, setAction] = State({ invite_id: "", action: "" });

const fetchData = async (id) => {
  try {
    const res = await api.getUsersById([id]);
    const user = await api.getUser();

    if (!res.length || user.id === id) {
      // Ura.create(<Toast message="Invalid user or page" delay={0} />);
      // return Ura.navigate("/user");
    }
    const action = await determineAction(id);
    setAction(action);
    setFriendData(res[0]);
  } catch (error) {
    api.handleError(error);
  }
};

function Friend() {
  const { id } = Ura.getQueries() || {};
  if (!id) {
    Ura.create(<Toast message={"rendering friend page"} delay={0} />)
    return Ura.navigate("/home");
  }

  events.addChild("friendship", "Friend.fetchData", () => fetchData(id));

  const handleAction = async (e) => {
    e.preventDefault();
    try {
      const name = getAction().action;
      const id_ = getAction().invite_id;
      //TODO: check if it's in friend 
      switch (name) {
        case "Send invitation":
          await api.inviteFriend(getUser().id);
          Ura.create(<Toast message="Invitation sent!" color='green' />);
          break;
        case "Accept invitation":
          await api.acceptInvitation(id_);
          Ura.create(<Toast message="Invitation accepted!" color='green' />);
          break;
        case "Cancel invitation":
          await api.cancelInvitation(id_);
          Ura.create(<Toast message="Invitation canceled!" color='green' />);
          break;
        case "Start conversation":
          Ura.navigate(`/chat?id=${getUser().id}`);
          break;

        case "Blocked user":
          Ura.create(<Toast message="User is blocked." />);
          return Ura.navigate("/home");
          break;
        default:
          console.log("unknown action");
          // Ura.create(<Toast message="Unknown action." color='green' />);
          break;
      }
      fetchData(id);
    } catch (error) {
      api.handleError(error);
      fetchData(id);
    }
  };

  fetchData(id)
  return render(() => (
    <root>
      <Navbar />
      <div className="friend" id={id}>
        <div id="center" >
          <div className="user-card">
            <div className="img-container">
              <img src={`${api.endpoint}${getUser().profile_picture}`} />
            </div>
            <div className="name">
              <h3>
                {`${getUser().firstname} ${getUser().lastname} (${getUser().display_name})`}
              </h3>
            </div>
          </div>
          <div className="user-btn">
            <button onclick={handleAction}>
              {getAction().action}
            </button>
          </div>
        </div>
        <div id="bottom">
          <div loop={[Swords, Award, WinCup]} id="games">
            {(Elem) => (
              <div id="history">
                <h4 id="title"><Elem />Games</h4>
                <div className="children">
                  <div className="child"><o>42%</o><h4>Pongers</h4></div>
                  <div className="child"><o>42%</o><h4>Pongers</h4></div>
                </div>
              </div>
            )}
          </div>
          <div id="friends">
            {/* <loop className="inner" on={getList()}>
            {(e, i) => (
              <div className="card" key={i}>
                <div className="content">
                  <div className="up">
                    <img src={e.src} onclick={() => Ura.navigate("/friend")} />
                    <h4>{e.title}</h4>
                  </div>
                  <div className="down">
                    <span onclick={() => Ura.navigate("/chat")} ><Chat /></span>
                    <span><Play /></span>
                  </div>
                </div>
              </div>
            )}
          </loop> */}
          </div>
        </div>
      </div>
    </root>
  ));
}

export default Friend
