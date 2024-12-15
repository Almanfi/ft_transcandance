import Ura from 'ura';
import Navbar from '../utils/Navbar/Navbar.jsx';
import Swords from '../utils/Swords/Swords.jsx';
import WinCup from '../utils/WinCup/WinCup.jsx';
import Award from '../utils/Award/Award.jsx';
import Settings from './settings/settings.jsx';
import Play from '../utils/Play/Play.jsx';
import Chat from '../utils/Chat/Chat.jsx';
function User() {
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
        Ura.e(Settings, { getShow: getShow, setShow: setShow }),
        Ura.e("div", { id: "center" },
            Ura.e("div", { className: "user-card" },
                Ura.e("div", { className: "img-container" },
                    Ura.e("img", { src: "/assets/profile.png", alt: "", onclick: () => setShow(true) })),
                Ura.e("div", { className: "name" },
                    Ura.e("h3", null, "Hrima mohammed")))),
        Ura.e("div", { id: "bottom" },
            Ura.e("div", { id: "games" },
                Ura.e("div", { id: "history" },
                    Ura.e("h4", { id: "title" },
                        Ura.e(Swords, null),
                        "Games"),
                    Ura.e("div", { className: "children" },
                        Ura.e("div", { className: "child" },
                            Ura.e("o", null, "42%"),
                            Ura.e("h4", null, "Pongers")),
                        Ura.e("div", { className: "child" },
                            Ura.e("o", null, "42%"),
                            Ura.e("h4", null, "Pongers")))),
                Ura.e("div", { id: "history" },
                    Ura.e("h4", { id: "title" },
                        Ura.e(Award, null),
                        " Winrate"),
                    Ura.e("div", { className: "children" },
                        Ura.e("div", { className: "child" },
                            Ura.e("o", null, "42%"),
                            Ura.e("h4", null, "Pongers")),
                        Ura.e("div", { className: "child" },
                            Ura.e("o", null, "42%"),
                            Ura.e("h4", null, "Pongers")))),
                Ura.e("div", { id: "history" },
                    Ura.e("h4", { id: "title" },
                        Ura.e(WinCup, null),
                        " Tournaments"),
                    Ura.e("div", { className: "children" },
                        Ura.e("div", { className: "child" },
                            Ura.e("o", null, "42%"),
                            Ura.e("h4", null, "Pongers")),
                        Ura.e("div", { className: "child" },
                            Ura.e("o", null, "42%"),
                            Ura.e("h4", null, "Pongers"))))),
            Ura.e("div", { id: "friends" },
                Ura.e("loop", { className: "inner", on: getList() }, (e, i) => (Ura.e("div", { className: "card", key: i },
                    Ura.e("div", { className: "content" },
                        Ura.e("div", { className: "up" },
                            Ura.e("h4", null, e.title)),
                        Ura.e("div", { className: "down" },
                            Ura.e("span", { onclick: () => Ura.navigate("/chat") },
                                Ura.e(Chat, null)),
                            Ura.e("span", null,
                                Ura.e(Play, null))))))))))));
}
export default User;
