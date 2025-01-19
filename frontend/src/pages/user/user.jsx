import Ura from 'ura';
import Navbar from '../../components/Navbar.js';
import api from '../../services/api.js';
import Relations from './utils/relations.js';

function User() {
  const [render, State] = Ura.init();
  const Show = State(false);
  const [getLoading, setLoading] = State(true);

  const userData = State({
    firstname: "",
    lastname: "",
    display_name: "",
    profile_picture: "/static/rest/images/users_profiles/profile.jpg",
  });

  const [getUserData, setUserData] = userData;
  const fetchData = async () => {
    try {
      const res = await api.getUser();
      const stats = await api.getStats();
      console.log("stats:", stats);
      res.stats = [{ title: "Played Games", pong: stats.stats[0], osnier: stats.stats[1] }, { title: "Won Games", pong: stats.stats[2], osnier: stats.stats[3] }]
      console.log("getUser:", res);
      setUserData(res);
    } catch (error) {
      console.log("it went through here:", error)
      api.handleError(error)
    }
  }
  fetchData();

  return render(() => (
    <root>
      <Navbar />
      <div if={getLoading() === true} className="user" >
        <div id="center" >
          <div className="user-card">
            <div className="img-container">
              <img
                src={`${api.endpoint}${getUserData().profile_picture}`}
                onclick={() => Ura.navigate("/settings")} />
            </div>
            <div className="name">
              <h3>
                {getUserData().firstname} {" "}
                {getUserData().lastname} {" "}
                ({getUserData().display_name})
              </h3>
            </div>
          </div>
        </div>
        <button id="btn-history" onclick={() => Ura.navigate("/history")}>
          see games history
        </button>

        <div id="bottom">
          <div loop={getUserData().stats} id="games">
            {(e) => (
              <div id="history">
                <h4 id="title">{e.title}</h4>
                <div className="children">
                  <div className="child"><o>{e.pong}</o><h4>Pongers</h4></div>
                  <div className="child"><o>{e.osnier}</o><h4>Osnier</h4></div>
                </div>
              </div>
            )}
          </div>
          <Relations />
        </div>
      </div>
    </root>
  ));
}

export default User
