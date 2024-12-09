import Ura from "ura";
import Navbar from "../utils/Navbar/Navbar.jsx";
// Ura.loadCSS("./home.css")
// import style from "./home.css"

// console.log(style);

function Home() {
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);

  // if (!Ura.store.get("user")) {
  //   Ura.navigate("/login")
  //   window.location.reload();
  // }
  // else
  return render(() => (
    <div className="home" >
      {/* <style rel="stylesheet" href="pages/home/home.css" /> */}
      <Navbar />
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
        <button onclick={() => Ura.navigate("/user")}>
          <h3>Enter the Arena</h3>
        </button>

      </div>
    </div>
  ));
}

export default Home;
