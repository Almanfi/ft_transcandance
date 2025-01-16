import Ura from 'ura';
import Navbar from '../../components/Navbar.jsx';
import Swords from '../../components/icons/Swords.jsx';
import WinCup from '../../components/icons/WinCup.jsx';
import Award from '../../components/icons/Award.jsx';
import Settings from './utils/settings.jsx';
import api from '../../services/api.jsx';
import Relations from './utils/relations.jsx';
import OpenGame from './utils/openGame.jsx';

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
        <Settings Show={Show} userData={userData} />
        <div id="center" >
          <div className="user-card">
            <div className="img-container">
              <img
                src={`${api.endpoint}${getUserData().profile_picture}`}
                onclick={() => Show[1](true)} />
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
          <Relations />
        </div>

        <div>
          <OpenGame />
        </div>
      </div>
    </root>
  ));
}

export default User
