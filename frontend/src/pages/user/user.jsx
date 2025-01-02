import Ura from 'ura';
import Navbar from '../../components/Navbar/Navbar.jsx';
import Swords from '../../components/Swords/Swords.jsx';
import WinCup from '../../components/WinCup/WinCup.jsx';
import Award from '../../components/Award/Award.jsx';
import Settings from './settings/settings.jsx';
import Play from '../../components/Play/Play.jsx';
import Chat from '../../components/Chat/Chat.jsx';
import api from '../../services/api.js';
import Toast from '../../components/Toast/Toast.jsx';

function User() {
  const [render, State] = Ura.init();
  const [getShow, setShow] = State(false);
  const [getLoading, setLoading] = State(true);
  const userData = State({
    firstname: "",
    lastname: "",
    display_name: "",
    profile_picture:"/static/rest/images/users_profiles/profile.jpg"
  });

  const [getUserData, setUserData] = userData;

  const fetchData = async () => {
    const Errors = [];

    try {
      const res = await api.getUser();
      console.log("response:", res);
      setUserData(res);
      console.log("img path", getUserData().profile_picture);
      // const img = await api.getPicture(getUserData().profile_picture);
      // console.log(img);
      
      const relations = await api.getRelations()
      console.log("relations:", relations);
      
      
      // setImage(`https://localhost:5000/${getUserData().profile_picture}`);
    } catch (err) {
      console.error("err", err);
      if (err.message) Errors.push(err.message);
      else if (typeof err == "object") {
        Object.keys(err).forEach((key) => {
          if (typeof err[key] === "string") Errors.push(err[key]);
          else if (err[key].length && typeof err[key][0] === "string")
            err[key].forEach(elem => Errors.push(`${elem} (${key})`))
          else Errors.push(key);
        });
      }
    }
    Errors.forEach((e, i) => Ura.create(<Toast message={e} delay={i} />))
  }
  fetchData();

  const [getList, setList] = State([
    { src: "/assets/003.png", title: "user 0" },
    { src: "/assets/003.png", title: "user 1" },
    { src: "/assets/003.png", title: "user 2" },
    { src: "/assets/003.png", title: "user 3" },
    { src: "/assets/003.png", title: "user 4" }
  ]);
  console.log("hello this is user:", getUserData());

  return render(() => (
    <if className="user" cond={getLoading() === true}>
      <Navbar />
      <Settings getShow={getShow} setShow={setShow} userData={userData} />
      <div id="center" >
        <div className="user-card">
          <div className="img-container">
            <img src={`${api.endpoint}${getUserData().profile_picture}`} alt="" onclick={() => setShow(true)} />
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
