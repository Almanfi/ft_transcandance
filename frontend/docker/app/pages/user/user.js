import Ura from 'ura';
import Navbar from '../utils/Navbar/Navbar.jsx';
import Swords from '../utils/Swords/Swords.jsx';
import WinCup from '../utils/WinCup/WinCup.jsx';
import Award from '../utils/Award/Award.jsx';
import Settings from './settings/settings.jsx';
function User() {
    const [render, State] = Ura.init();
    const [getItem, setItem] = State("item-1");
    const images = [
        "https://via.placeholder.com/600x300?text=Slide+1",
        "https://via.placeholder.com/600x300?text=Slide+2",
        "https://via.placeholder.com/600x300?text=Slide+3",
    ];
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
    return render(() => (Ura.e("div", { className: "user" },
        Ura.e(Navbar, null),
        Ura.e(Settings, null),
        Ura.e("div", { id: "center" },
            Ura.e("div", { className: "user-card" },
                Ura.e("img", { src: "/assets/profile.png", alt: "", onclick: () => Ura.navigate("/settings") }),
                Ura.e("h3", null, "Hrima mohammed"))),
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
export default User;
