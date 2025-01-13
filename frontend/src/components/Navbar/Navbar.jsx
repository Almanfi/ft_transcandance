import Ura from "ura";
import Menu from "../icons/Menu/Menu.js";
import api from "../../services/api.js";

// import "./Navbar.css"

function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }
}

function Navbar() {
  const [render, State] = Ura.init();
  const [getShow, setShow] = State(false);
  const [getList, setList] = State([]);

  const handleClique = () => setShow(!getShow())

  const search = async (e) => {
    e.preventDefault();
    const value = e.target.value;
    if (value.length === 0) setList([]);
    else {
      try {
        const res = await api.searchUser(value);
        console.log("search respone", res);
        setList(res);
      } catch (err) {
        api.handleError(err)
      }
    }
  }

  const handleInput = debounce(search, 100)
  const seeFriend = (data) => {
    console.log("go to /friend with ", data.id);
    Ura.navigate(`/friend?id=${data.id}`);
  }

  const handleLogout = (e) => {
    api.logout();
  }

  return render(() => (
    <div className="navbar">
      <div id="logo" onclick={() => { Ura.navigate("/home") }}>
        <img src="/assets/tr.png" /><h4>Clashers</h4>
      </div>
      <input type="text" placeholder="Search.." oninput={handleInput} />
      <button className="show-navbar" onclick={handleClique}><Menu /></button>
      <loop on={getList()} className="search-loop">
        {(e) => (<div onclick={() => seeFriend(e)} >{e.firstname} {e.lastname} ({e.display_name})</div>)}
      </loop>

      <div className={`toogle-bar-${getShow() ? "show" : "hidden"}`}>
        <button id="login-btn" onclick={() => Ura.navigate("/login")}
          style={{ display: Ura.getCookie("id_key") ? "none" : "block" }}>
          <h4>Login</h4>
        </button>
        <button id="signup-btn" onclick={() => Ura.navigate("/signup")}
          style={{ display: Ura.getCookie("id_key") ? "none" : "block" }}>
          <h4>Sign up</h4>
        </button>
        <button id="login-btn" onclick={handleLogout}
          style={{ display: !Ura.getCookie("id_key") ? "none" : "block" }}>
          <h4>Logout</h4>
        </button>
      </div>

    </div>
  ));
}

export default Navbar;
