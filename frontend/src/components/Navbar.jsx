import Ura, { getCookie, navigate } from "ura";
import Menu from "./icons/Menu.js";
import api from "../services/api.js";
import events from "../services/events.js";


function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }
}

const [render, State] = Ura.init();
const [getNotif, setNotif] = State([])
// keep outside, used to show searches
const [getList, setList] = State([]);
const [getShow, setShow] = State(false);



const handleShowNotif = () => {
  navigate("/notifications")
  setShow(false)
};


function Navbar() {

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
    setList([]);
    document.getElementById("search_input").value = "";
  }

  const handleLogout = (e) => {
    api.logout();
  }


  return render(() => (
    <div className="navbar">

      <nav>
        <div className="logo" onclick={() => navigate("/home")}>
          <img src="/assets/clasher.png" />
        </div>
        <div if={Ura.getCookie("id_key")} className="search"  >
          <input type="text" placeholder="Search" id="search_input" oninput={handleInput} />
          <div loop={getList()} className="elems">
            {(e) => (<div onclick={() => seeFriend(e)} >{e.firstname} {e.lastname} ({e.display_name})</div>)}
          </div>
        </div>
        {/* 
        <ul if={Ura.getCookie("id_key")} className="toggle-notif">
          <loop on={getNotif()} className="notifi-box" id="box">
            {(e) => (
              <div className="data">
                <span className="title">
                  <h4>{e.content}</h4>
                </span>
                <span className="action">
                  <h4 className="accept" onclick={e.accept} ></h4>
                  <h4 className="refuse" onclick={e.refuse}></h4>
                </span>
              </div>
            )}
          </loop>
        </ul> */}

        <li className="list">
          <ul className={`menuList ${getShow() ? "show" : ""}`} >
            <a if={getCookie("id_key")} className="see-notif" onclick={handleShowNotif}>Notifications</a>
            <a if={!getCookie("id_key")} onclick={() => { setShow(!getShow()), navigate("/login") }}>
              Login
            </a>
            <a if={!getCookie("id_key")} onclick={() => { setShow(!getShow()), navigate("/signup") }}>
              Sign up
            </a>
            <a if={getCookie("id_key")} onclick={() => { setShow(!getShow()), handleLogout() }} >
              Logout
            </a>
          </ul>
        </li>
        <div className="menu-icon" onclick={()=>setShow(!getShow())}>
          <i >+</i>
        </div>
      </nav>
    </div>
  ));
}

export default Navbar;
