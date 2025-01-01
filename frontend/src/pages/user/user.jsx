import Ura from 'ura';
import Navbar from '../../components/Navbar/Navbar.jsx';
import Swords from '../../components/Swords/Swords.jsx';
import WinCup from '../../components/WinCup/WinCup.jsx';
import Award from '../../components/Award/Award.jsx';
import Settings from './settings/settings.jsx';
import Play from '../../components/Play/Play.jsx';
import Chat from '../../components/Chat/Chat.jsx';
import api from '../../services/api.js';

function User() {
  const [render, State] = Ura.init();
  const [getShow, setShow] = State(false);
  const [getLoading, setLoading] = State(true);
  const [getUserData, setUserData] = State({
    // profile_picture: "/static/rest/images/users_profiles/default.jpg"
  });
  let user = JSON.parse(Ura.store.get("user") || "{}");

  api.getUser().then((fetchedUser) => {
    console.log("this is the response", fetchedUser);

    Ura.store.set("user", JSON.stringify(fetchedUser));
    setUserData(fetchedUser);
  })
  .catch((error) => {
    console.error("Error fetching user data:", error);
  })
  .finally(() => {
    setLoading(false); // Update loading state
  });

  const [getList, setList] = State([
    { src: "/assets/003.png", title: "user 0" },
    { src: "/assets/003.png", title: "user 1" },
    { src: "/assets/003.png", title: "user 2" },
    { src: "/assets/003.png", title: "user 3" },
    { src: "/assets/003.png", title: "user 4" }
  ]);
  console.log("hello this is user:", user);

  return render(() => (
    <if className="user" cond={getLoading() === false}>
      <Navbar />
      <Settings getShow={getShow} setShow={setShow} setUserData={setUserData} />
      <div id="center" >
        <div className="user-card">
          <div className="img-container">
            <img src={`/api/${getUserData().profile_picture}`} alt="" onclick={() => setShow(true)} />
          </div>
          <div className="name">
            <h3>
              {`${getUserData().firstname} ${getUserData().lastname} (${getUserData().display_name})`}
            </h3>
          </div>
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
          <loop className="inner" on={getList()}>
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
          </loop>
        </div>
      </div>
    </if>
  ));
}

export default User
