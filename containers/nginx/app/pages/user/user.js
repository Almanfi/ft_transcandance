import Ura from 'ura';
import Navbar from '../../components/Navbar/Navbar.jsx';
import Swords from '../../components/Swords/Swords.jsx';
import WinCup from '../../components/WinCup/WinCup.jsx';
import Award from '../../components/Award/Award.jsx';
import Settings from './settings/settings.jsx';
import Play from '../../components/Play/Play.jsx';
import Chat from '../../components/Chat/Chat.jsx';
// import api from '../../services/api.js';
async function User() {
    const [render, State] = Ura.init();
    const [getShow, setShow] = State(false);
    let user = JSON.parse(Ura.store.get("user") || "{}");
    const [getList, setList] = State([
        { src: "/assets/003.png", title: "user 0" },
        { src: "/assets/003.png", title: "user 1" },
        { src: "/assets/003.png", title: "user 2" },
        { src: "/assets/003.png", title: "user 3" },
        { src: "/assets/003.png", title: "user 4" }
    ]);
    console.log("hello this is user:", user);
    const src = ""; // api.getPicture(user.profile_picture)
    console.log("src:", src);
    return render(() => (Ura.e("div", { className: "user" },
        Ura.e("div", { id: "bottom" }))));
}
export default User;
