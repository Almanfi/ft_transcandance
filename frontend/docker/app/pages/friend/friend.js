import Ura from 'ura';
import Navbar from '../utils/Navbar/Navbar.jsx';
import Swords from '../utils/Swords/Swords.jsx';
import WinCup from '../utils/WinCup/WinCup.jsx';
import Award from '../utils/Award/Award.jsx';
import Settings from './settings/settings.jsx';
import Play from '../utils/Play/Play.jsx';
import Chat from '../utils/Chat/Chat.jsx';
function Friend() {
    const [render, State] = Ura.init();
    const [getShow, setShow] = State(false);
    const [getList, setList] = State([
        { src: "/assets/003.png", title: "user 0" },
        { src: "/assets/003.png", title: "user 1" },
        { src: "/assets/003.png", title: "user 2" },
        { src: "/assets/003.png", title: "user 3" },
        { src: "/assets/003.png", title: "user 4" }
    ]);
    return render(() => (Ura.e("div", { className: "user" },
        Ura.e(Navbar, null),
        Ura.e("div", { id: "center" },
            Ura.e("div", { className: "user-card" },
                Ura.e("div", { className: "img-container" },
                    Ura.e("img", { src: "/assets/profile.png", alt: "", onclick: () => setShow(true) })),
                Ura.e("div", { className: "name" },
                    Ura.e("h3", null, "Friend")))),
        Ura.e("div", { id: "bottom" },
            Ura.e("loop", { on: [Swords, Award, WinCup], id: "games" }, (Elem) => (Ura.e("div", { id: "history" },
                Ura.e("h4", { id: "title" },
                    Ura.e(Elem, null),
                    "Games"),
                Ura.e("div", { className: "children" },
                    Ura.e("div", { className: "child" },
                        Ura.e("o", null, "42%"),
                        Ura.e("h4", null, "Pongers")),
                    Ura.e("div", { className: "child" },
                        Ura.e("o", null, "42%"),
                        Ura.e("h4", null, "Pongers")))))),
            Ura.e("div", { id: "friends" })))));
}
export default Friend;
