import Ura, { getCookie, navigate } from "ura";
import api from "../services/api.js";
import { debounce } from "../services/utils.js";



const [render, State] = Ura.init();
const [getNotif, setNotif] = State([])
// keep outside, used to show searches
const [getList, setList] = State([]);


function Navbar() {

  const hide = () => document.getElementsByClassName("menuList")[0]?.classList.remove("show");
  const show = () => document.getElementsByClassName("menuList")[0]?.classList.add("show");

  const search = async (e) => {
    hide()
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
    hide()
    console.log("go to /friend with ", data.id);
    Ura.navigate(`/friend?id=${data.id}`);
    setList([]);
    document.getElementById("search_input").value = "";
  }

  const handleShowNotif = () => {
    const dom = document.getElementsByClassName("menuList")[0];
    if (dom) {
      if (dom.classList.contains("show")) hide();
      else show();
    }
  };

  const handleLogout = () => { hide(), api.logout() }
  const handleNavigate = (path) => { hide(), navigate(path) }

  return render(() => (
    <div className="navbar">

      <nav>
        <div className="logo" onclick={() => handleNavigate("/home")}>
          <img src="/assets/clasher.png" />
        </div>
        <div if={Ura.getCookie("id_key")} className="search"  >
          <input type="text" placeholder="Search" id="search_input" oninput={handleInput} />
          <div loop={getList()} className="elems">
            {(e) => (<div onclick={() => seeFriend(e)} >{e.firstname} {e.lastname} ({e.display_name})</div>)}
          </div>
        </div>

        <li className="list">
          <ul className={`menuList`} >
            <a if={getCookie("id_key")} onclick={() => navigate("/user")}>Profile</a>
            <a if={getCookie("id_key")} className="see-notif" onclick={() => handleNavigate("/notifications")}>Notifications</a>
            <a if={!getCookie("id_key")} onclick={() => handleNavigate("/login")}> Login </a>
            <a if={!getCookie("id_key")} onclick={() => handleNavigate("/signup")}>Sign up</a>
            <a if={getCookie("id_key")} onclick={handleLogout} >Logout</a>
          </ul>
        </li>
        <div className="menu-icon" onclick={handleShowNotif}>
          <i >+</i>
        </div>
      </nav>
    </div>
  ));
}

export default Navbar;
