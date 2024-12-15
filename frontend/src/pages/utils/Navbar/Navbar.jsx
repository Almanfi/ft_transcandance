import Ura from "ura";
import Menu from "../Menu/Menu.js";

function Navbar() {
  const [render, State] = Ura.init();
  const [getShow, setShow] = State(false);
  const handleClique = ()=> setShow(!getShow())

  return render(() => (
    <div className="navbar">
      <div id="logo" onclick={() => { Ura.navigate("/home") }}>
        <img src="/assets/tr.png" />Clashers
      </div>
      <input type="text" placeholder="Search.." />
      <button className="show-navbar" onclick={handleClique}><Menu/></button>
      <div className={`toogle-bar-${getShow() ? "show" : "hidden"}`}>
        <button id="login-btn" onclick={() => { Ura.navigate("/login") }} >
          <h4>Login</h4>
        </button>
        <button id="signup-btn" onclick={() => { Ura.navigate("/signup") }} >
          <h4>Sign up</h4>
        </button>
      </div>

    </div>
  ));
}

export default Navbar;

/*
   @media (min-width: 1025px) {
        & .inner {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      @media (min-width: 1025px) {
        & .inner {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      @media (min-width: 1025px) {
        & .inner {
          grid-template-columns: repeat(3, 1fr);
        }
      }


*/