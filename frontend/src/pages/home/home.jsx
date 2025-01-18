import Ura from "ura";
import Navbar from "../../components/Navbar.js";

function Home() {
  const [render] = Ura.init();
  return render(() => (
    <root>
      <Navbar />
      <div className="home" >
        <div id="center">
          <h1>
            Join Your <b>Friends</b>
          </h1>
          <h1>and</h1>
          <h1>
            <o>Beat</o> them
          </h1>
        </div>
        <div id="bottom">
          <button onclick={() => Ura.navigate("/choosegame")}>
            <h3>Enter the Arena</h3>
          </button>
        </div>
      </div>
    </root>
  ));
}

export default Home;
