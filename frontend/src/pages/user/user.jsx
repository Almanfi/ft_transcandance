import Ura from 'ura';
import Navbar from '../../components/Navbar/Navbar.js';
import Swords from '../../components/icons/Swords/Swords.js';
import WinCup from '../../components/icons/WinCup/WinCup.js';
import Award from '../../components/icons/Award/Award.js';
import Settings from './settings/settings.js';
import api from '../../services/api.js';
import Relations from './relations/relations.js';

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
      <if className="user" cond={getLoading() === true}>
        <Navbar />
        <Settings Show={Show} userData={userData} />
        <div id="center" >
          <div className="user-card">
            <div className="img-container">
              <img
                src={`${api.endpoint}${getUserData().profile_picture}`}
                alt="" onclick={() => Show[1](true)} />
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
      </if>
    </root>
  ));
}

export default User
