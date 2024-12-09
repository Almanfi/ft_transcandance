import Ura from 'ura';
import Navbar from '../utils/Navbar/Navbar.jsx';
import Swords from '../utils/Swords/Swords.jsx';
import WinCup from '../utils/WinCup/WinCup.jsx';
import Award from '../utils/Award/Award.jsx';

function User() {
  const [render, State] = Ura.init();
  const [getItem, setItem] = State("item-1");
  const images = [
    "https://via.placeholder.com/600x300?text=Slide+1",
    "https://via.placeholder.com/600x300?text=Slide+2",
    "https://via.placeholder.com/600x300?text=Slide+3",
  ];
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

  const handle = (direction) => {
    const totalSlides = getList().length;
    let currentValue = getValue();
    if (direction === "left") {
      currentValue = currentValue - 1;
      if (currentValue < 0) currentValue = totalSlides - 1;
    } else if (direction === "right") {
      currentValue = (currentValue + 1) % totalSlides;
    }
    console.log("set value to", currentValue);
    setValue(currentValue);
  };

  return render(() => (
    <div className="user">
      <Navbar />
      <div id="center" >
        <div className="user-card">
          <img src="/assets/profile.png" alt="" onclick={()=> Ura.navigate("/settings")}/>
          <h3>
            Hrima mohammed
          </h3>
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
          <div className="container">
            {/* on hover move with 1 on click move with 2 */}
            <button className="carousel-btn left" onclick={() => handle("left")}>{"<"}</button>
            <div className="center">
              <div className="wrapper">
                <dloop className="inner" on={getList()}
                  style={{ transform: `translateX(-${getValue() * 10}%)`, transition: "2s", gap:"10px" }}>
                  {(e, i) => (
                    <div className="card" key={i}>
                      <div className="content">
                        <div className="up">
                          <img src={e.src}/>
                          <h4>{e.title}</h4>
                        </div>
                        <div className="bottom">
                          <span>chat</span>
                          <span>play</span>
                        </div>
                      </div>
                    </div>
                  )}
                </dloop>
              </div>
            </div>
            <button className="carousel-btn right" onclick={() => handle("right")}>{">"}</button>
          </div>
        </div>

      </div>
    </div>
  ));
}

export default User
