import Ura, { getCookie, navigate } from "ura";
import Menu from "./icons/Menu.jsx";
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

const updateNavbar = async () => {
  try {
    let res = [];
    if (getCookie("id_key")) {
      const friends = await api.getInvited();
      console.log("call update handler", friends);
      res = friends.map(e => ({
        type: "friendship",
        content: `friendship request from ${e.display_name}`,
        accept: async () => {
          try {
            await api.acceptInvitation(e.invite_id)
          } catch (error) {
            api.handleError(error)
          }
          // updateNavbar();
          // events.emitChildren("friendship_received")
          Ura.refresh();
        },
        refuse: async () => {
          try {
            await api.refuseInvitation(e.invite_id)
          } catch (error) {
            api.handleError(error)
          }
          // updateNavbar();
          // events.emitChildren("friendship_received")
          Ura.refresh();
        }
      }))
    }
    setNotif(res);
  } catch (error) {
    api.handleError(error);
  }
}

const addMessageNotification = async (data) => {
  data = data[0];
  const curr = await api.getUser();
  const { id } = Ura.getQueries()
  console.log("current id:", id);
  console.log("current route", Ura.getCurrentRoute());
  console.log("from:", data);
  console.log("curr:", curr.id);

  if (data.status !== 'sent') {
    try {
      const user = await api.getUsersById([data.from]);
      let res = {
        type: "message",
        content: `New message from ${user[0].display_name}`,
        accept: () => navigate(`/chat?id=${user[0].id}`),
        refuse: () => { },
      }
      setNotif([
        ...getNotif(),
        res
      ])
      // Ura.refresh();

    } catch (error) {
      api.handleError(error)
    }
    console.error("received message");
  }
}

const handleShowNotif = () => {
  navigate("/notifications")
};

function Navbar() {
  // events.addChild("friendship", "Navbar.updateNavbar", updateNavbar);
  // handleShowNotif();


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

  function toggleMenu() {
    let menuList = document.getElementsByClassName("menuList")[0];
    menuList.classList.toggle("show");
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
          <ul className="menuList" >
            <a if={getCookie("id_key")}
              className="see-notif"
              onclick={handleShowNotif}>Notifications</a>
            <a if={getCookie("id_key")}
              className="go-notif" >Go to Notifications</a>
            <a if={!getCookie("id_key")}
              onclick={() => navigate("/login")}>
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
