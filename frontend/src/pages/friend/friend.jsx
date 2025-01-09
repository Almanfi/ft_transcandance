import Ura from 'ura';
import Navbar from '../../components/Navbar/Navbar.js';
import Swords from '../../components/Swords/Swords.js';
import WinCup from '../../components/WinCup/WinCup.js';
import Award from '../../components/Award/Award.js';
import Play from '../../components/Play/Play.js';
import Chat from '../../components/Chat/Chat.js';
import api from '../../services/api.js';
import Toast from '../../components/Toast/Toast.jsx';

function Friend() {
  const { id } = Ura.getQueries() || {};
  if (!id)
    return Ura.create(<Toast message={"rendering friend page"} delay={0} />)

  const [render, State] = Ura.init();
  const [getData, setData] = State([]);

  const [getUserData, setUserData] = State({
    firstname: "",
    lastname: "",
    display_name: "",
    profile_picture: "/static/rest/images/users_profiles/profile.jpg"
  });



  const fetchData = async () => {
    const Errors = [];
    let reload = false;

    console.log("search for id", id);
    try {


      const res = await api.getUsersById([id]);
      console.log("friend response:", res);
      setUserData(res[0]);
      // console.log("img path", getUserData().profile_picture);
      // const img = await api.getPicture(getUserData().profile_picture);
      // console.log(img);

      // const relations = await api.getRelations()
      // console.log("relations:", relations);
      // setData(relations["friends"]);
      // console.log("data", getData());



      // setImage(`https://localhost:5000/${getUserData().profile_picture}`);
    } catch (err) {
      console.error("err", err);
      if (err.message) Errors.push(err.message);
      else if (err.status === 403) {
        Errors.push("Internal Error");
        reload = true
      }
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
    if (reload) Ura.rmCookie("id_key");
  }
  fetchData();

  return render(() => (
    <div className="friend">
      <Navbar />
      <div id="center" >
        <div className="user-card">
          <div className="img-container">
            <img
              src={`${api.endpoint}${getUserData().profile_picture}`}
              alt="" onclick={() => setShow(true)} />
          </div>
          <div className="name">
            <h3>
              {getUserData().firstname} {" "}
              {getUserData().lastname} {" "}
              ({getUserData().display_name})
            </h3>
          </div>
        </div>
        <div className="user-btn">
          <button>
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
                    <img src={e.src} onclick={()=> Ura.navigate("/friend")}/>
                    <h4>{e.title}</h4>
                  </div>
                  <div className="down">
                    <span onclick={() => Ura.navigate("/chat")} ><Chat/></span>
                    <span><Play/></span>
                  </div>
                </div>
              </div>
            )}
          </loop> */}
        </div>
      </div>
    </div>
  ));
}

export default Friend
