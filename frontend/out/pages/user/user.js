import Ura from 'ura';
import Navbar from '../utils/Navbar/Navbar.jsx';
import Swords from '../utils/Swords/Swords.jsx';
import WinCup from '../utils/WinCup/WinCup.jsx';
import Award from '../utils/Award/Award.jsx';
import Settings from './settings/settings.jsx';
function User() {
    const [render, State] = Ura.init();
    const [getShow, setShow] = State(false);
    const [getList, setList] = State([
        {
            src: "/assets/003.png",
            title: "Product Design 0", subtitle: "UI/UX, Design",
        },
        {
            src: "/assets/003.png",
            title: "Product Design 1", subtitle: "UI/UX, Design",
        },
        {
            src: "/assets/003.png",
            title: "Product Design 2", subtitle: "UI/UX, Design",
        },
        {
            src: "/assets/003.png",
            title: "Product Design 3", subtitle: "UI/UX, Design",
        },
        {
            src: "/assets/003.png",
            title: "Product Design 4", subtitle: "UI/UX, Design",
        }
    ]);
    const [getValue, setValue] = State(0);
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
                        Ura.e("div", { className: "bottom" },
                            Ura.e("span", null, "chat"),
                            Ura.e("span", null, "play")))))))))));
}
export default User;
