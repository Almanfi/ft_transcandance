import Ura, { getCookie, navigate } from "ura";
import Menu from "../icons/Menu/Menu.js";
import api from "../../services/api.js";
import { handelNotif } from "../../pages/main.js";

// import "./Navbar.css"

function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }
}

// export {
//   Notif,
// }


const [render, State] = Ura.init();

const Notif = State([
  // {
  //   type: "friendship",
  //   content: "notification",
  //   accept: () => { console.log("call accept") },
  //   refuse: () => { console.log("call refuse") }
  // }
]);

function Navbar() {

  const [getNotif, setNotif] = Notif;
  handelNotif.setter = setNotif;
  handelNotif.getter = getNotif;

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

  let down = false;
  const handleShowNotif = () => {
    let box = document.getElementById("box");
    if (box) {
      if (down) box.classList.remove("show");
      else box.classList.add("show");
      down = !down;
    }
  }

  function toggleMenu() {
    let menuList = document.getElementsByClassName("menuList")[0];
    menuList.classList.toggle("show");
  }
  
  return render(() => (
    <div className="navbar">
      <nav>
        <div className="logo" onclick={() => navigate("/home")}>
          <img src="/assets/tr.png" />
        </div>
        <div className="search">
          <input if={Ura.getCookie("id_key")} type="text" placeholder="Search" oninput={handleInput} />
          <loop on={getList()} className="elems">
            {(e) => (<div onclick={() => seeFriend(e)} >{e.firstname} {e.lastname} ({e.display_name})</div>)}
          </loop>
        </div>

        <ul if={Ura.getCookie("id_key")} className="toggle-notif">
          <loop on={getNotif()} className="notifi-box" id="box">
            <h3>Notification</h3>
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
            )
            }
          </loop>
        </ul>

        <li className="list">
          <ul className="menuList" >
            <a className="see-notif" onclick={handleShowNotif}>Notif ({getNotif().length})</a>
            <a className="go-notif">Go to Notifications</a>
            <a if={!getCookie("id_key")} onclick={() => navigate("/login")}>
              Login
            </a>
            <a if={!getCookie("id_key")} onclick={() => navigate("/login")}>
              Sign up
            </a>
            <a if={getCookie("id_key")} onclick={handleLogout} >
              Logout
            </a>
          </ul>
        </li>
        <div className="menu-icon" onclick={toggleMenu}>
          <i className="fa-solid fa-bars">+</i>
        </div>
      </nav>
    </div>
  ));
}

export default Navbar;
