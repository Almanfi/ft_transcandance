import Ura from 'ura';
import Navbar from '../utils/Navbar/Navbar.jsx';
import Swords from '../utils/Swords/Swords.jsx';
import WinCup from '../utils/WinCup/WinCup.jsx';
import Award from '../utils/Award/Award.jsx';
import Settings from './settings/settings.jsx';
function Friend() {
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
    const handle = (direction) => {
        const totalSlides = getList().length;
        let currentValue = getValue();
        if (direction === "left") {
            currentValue = currentValue - 1;
            if (currentValue < 0)
                currentValue = totalSlides - 1;
        }
        else if (direction === "right") {
            currentValue = (currentValue + 1) % totalSlides;
        }
        console.log("set value to", currentValue);
        setValue(currentValue);
    };
    return render(() => (Ura.e("div", { className: "friend" },
        Ura.e(Navbar, null),
        Ura.e(Settings, { getShow: getShow, setShow: setShow }),
        Ura.e("div", { id: "center" },
            Ura.e("div", { className: "user-card" },
                Ura.e("img", { src: "/assets/profile.png", alt: "", onclick: () => setShow(true) }),
                Ura.e("h3", null, "Friend"))),
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
                Ura.e("div", { className: "container" },
                    Ura.e("button", { className: "carousel-btn left", onclick: () => handle("left") }, "<"),
                    Ura.e("div", { className: "center" },
                        Ura.e("div", { className: "wrapper" },
                            Ura.e("dloop", { className: "inner", on: getList(), style: { transform: `translateX(-${getValue() * 10}%)`, transition: "2s", gap: "10px" } }, (e, i) => (Ura.e("div", { className: "card", key: i },
                                Ura.e("div", { className: "content" },
                                    Ura.e("div", { className: "up" },
                                        Ura.e("img", { src: e.src }),
                                        Ura.e("h4", null, e.title)),
                                    Ura.e("div", { className: "bottom" },
                                        Ura.e("span", null, "chat"),
                                        Ura.e("span", null, "play")))))))),
                    Ura.e("button", { className: "carousel-btn right", onclick: () => handle("right") }, ">")))))));
}
export default Friend;
