import Ura from 'ura';
import Navbar from '../../components/Navbar/Navbar.js';
import Swords from '../../components/icons/Swords/Swords.js';
import WinCup from '../../components/icons/WinCup/WinCup.js';
import Award from '../../components/icons/Award/Award.js';
import Play from '../../components/icons/Play/Play.js';
import Chat from '../../components/icons/Chat/Chat.js';
import api from '../../services/api.js';
import Toast from '../../components/Toast/Toast.js';

function Friend() {
  const { id } = Ura.getQueries() || {};
  if (!id) {
    Ura.create(<Toast message={"rendering friend page"} delay={0} />)
    return Ura.navigate("/home");
  }
  else if (id === Ura.store.get("id"))
    return Ura.navigate("/user");


  const [render, State] = Ura.init();
  const [getList, setList] = State([]);
  const [getRelations, setRelations] = State({
    blocks: [],
    friends: [],
    invited: [],
    invites: []
  });

  const [getAction, setAction] = State("Add friend");

  const [getUser, setUser] = State({
    id: "",
    firstname: "",
    lastname: "",
    display_name: "",
    profile_picture: "/static/rest/images/users_profiles/profile.jpg"
  });

  const fetchData = async () => {
    console.log("search for id", id);
    try {
      const res = await api.getUsersById([id]);

      if (res.length === 0) {
        Ura.create(<Toast message={"user not found"} />);
        Ura.navigate("/home");
      }
      else {
        const relations = await api.getRelations();
        console.log("user infos:", res);
        console.log("relations:", relations);
        setUser(res[0]);
      }
    } catch (error) {
      api.handleError(error)
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      console.log("send invitation to ", getUser().id);
      const res = await api.inviteFriend(getUser().id);

    } catch (error) {
      api.handleError(error)
    }
  }

  fetchData()
  return render(() => (
    <root>
      <div className="friend" id={id}>
        <Navbar />
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
            <button onclick={handleInvite}>
              Add friend
            </button>
          </div>
        </div>
        <div id="bottom">
          <loop on={[Swords, Award, WinCup]} id="games">
            {(Elem) => (
              <div id="history">
                <h4 id="title"><Elem />Games</h4>
                <div className="children">
                  <div className="child"><o>42%</o><h4>Pongers</h4></div>
                  <div className="child"><o>42%</o><h4>Pongers</h4></div>
                </div>
              </div>
            )}
          </loop>
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
