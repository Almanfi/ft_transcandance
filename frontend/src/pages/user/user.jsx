import Ura from 'ura';
import Navbar from '../utils/Navbar/Navbar.jsx';
import Swords from '../utils/Swords/Swords.jsx';
import WinCup from '../utils/WinCup/WinCup.jsx';
import Award from '../utils/Award/Award.jsx';
import Settings from './settings/settings.jsx';

function User() {
  const [render, State] = Ura.init();
  const [getShow, setShow] = State(false);

  const [getList, setList] = State([
    {
      src: "/assets/003.png",
      title: "Product Design 0", subtitle: "UI/UX, Design",
    },
    {
      src: "/assets/003.png",
      title: "Product Design 1", subtitle: "UI/UX, Design",
    },
    {
      src: "/assets/003.png",
      title: "Product Design 2", subtitle: "UI/UX, Design",
    },
    {
      src: "/assets/003.png",
      title: "Product Design 3", subtitle: "UI/UX, Design",
    },
    {
      src: "/assets/003.png",
      title: "Product Design 4", subtitle: "UI/UX, Design",
    }
  ]);
  const [getValue, setValue] = State(0);

  return render(() => (
    <div className="user">
      <Navbar />
      <Settings getShow={getShow} setShow={setShow} />
      <div id="center" >
        <div className="user-card">
          <div className="img-container">
            <img src="/assets/profile.png" alt="" onclick={() => setShow(true)} />
          </div>
          <div className="name">
            <h3>Hrima mohammed</h3>
          </div>
        </div>
      </div>
      <div id="bottom">

        <div id="games">
          <div id="history">
            <h4 id="title"><Swords />Games</h4>
            <div className="children">
              <div className="child"><o>42%</o><h4>Pongers</h4></div>
              <div className="child"><o>42%</o><h4>Pongers</h4></div>
            </div>
          </div>
          <div id="history">
            <h4 id="title"><Award /> Winrate</h4>
            <div className="children">
              <div className="child"><o>42%</o><h4>Pongers</h4></div>
              <div className="child"><o>42%</o><h4>Pongers</h4></div>
            </div>
          </div>
          <div id="history">
            <h4 id="title"><WinCup /> Tournaments</h4>
            <div className="children">
              <div className="child"><o>42%</o><h4>Pongers</h4></div>
              <div className="child"><o>42%</o><h4>Pongers</h4></div>
            </div>
          </div>
        </div>

        <div id="friends">
          <loop className="inner" on={getList()}>
            {(e, i) => (
              <div className="card" key={i}>
                <div className="content">
                  <div className="up">
                    {/* <img src={e.src} /> */}
                    <h4>{e.title}</h4>
                  </div>
                  <div className="down">
                    <span onclick={() => Ura.navigate("/chat")} >chat</span>
                    <span>play</span>
                  </div>
                </div>
              </div>
            )}
          </loop>
        </div>
      </div>
    </div>
  ));
}

export default User
