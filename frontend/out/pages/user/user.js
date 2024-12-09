import Ura from 'ura';
import Navbar from '../utils/Navbar/Navbar.jsx';
import Swords from '../utils/Swords/Swords.jsx';
import WinCup from '../utils/WinCup/WinCup.jsx';
import Award from '../utils/Award/Award.jsx';
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
    return render(() => (Ura.element("div", { className: "user" },
        Ura.element(Navbar, null),
        Ura.element("div", { id: "center" },
            Ura.element("div", { className: "user-card" },
                Ura.element("img", { src: "/assets/profile.png", alt: "", onclick: () => Ura.navigate("/settings") }),
                Ura.element("h3", null, "Hrima mohammed"))),
        Ura.element("div", { id: "bottom" },
            Ura.element("div", { id: "games" },
                Ura.element("div", { id: "history" },
                    Ura.element("h4", { id: "title" },
                        Ura.element(Swords, null),
                        "Games"),
                    Ura.element("div", { className: "children" },
                        Ura.element("div", { className: "child" },
                            Ura.element("o", null, "42%"),
                            Ura.element("h4", null, "Pongers")),
                        Ura.element("div", { className: "child" },
                            Ura.element("o", null, "42%"),
                            Ura.element("h4", null, "Pongers")))),
                Ura.element("div", { id: "history" },
                    Ura.element("h4", { id: "title" },
                        Ura.element(Award, null),
                        " Winrate"),
                    Ura.element("div", { className: "children" },
                        Ura.element("div", { className: "child" },
                            Ura.element("o", null, "42%"),
                            Ura.element("h4", null, "Pongers")),
                        Ura.element("div", { className: "child" },
                            Ura.element("o", null, "42%"),
                            Ura.element("h4", null, "Pongers")))),
                Ura.element("div", { id: "history" },
                    Ura.element("h4", { id: "title" },
                        Ura.element(WinCup, null),
                        " Tournaments"),
                    Ura.element("div", { className: "children" },
                        Ura.element("div", { className: "child" },
                            Ura.element("o", null, "42%"),
                            Ura.element("h4", null, "Pongers")),
                        Ura.element("div", { className: "child" },
                            Ura.element("o", null, "42%"),
                            Ura.element("h4", null, "Pongers"))))),
            Ura.element("div", { id: "friends" },
                Ura.element("div", { className: "container" },
                    Ura.element("button", { className: "carousel-btn left", onclick: () => handle("left") }, "<"),
                    Ura.element("div", { className: "center" },
                        Ura.element("div", { className: "wrapper" },
                            Ura.element("dloop", { className: "inner", on: getList(), style: { transform: `translateX(-${getValue() * 10}%)`, transition: "2s", gap: "10px" } }, (e, i) => (Ura.element("div", { className: "card", key: i },
                                Ura.element("div", { className: "content" },
                                    Ura.element("div", { className: "up" },
                                        Ura.element("img", { src: e.src }),
                                        Ura.element("h4", null, e.title)),
                                    Ura.element("div", { className: "bottom" },
                                        Ura.element("span", null, "chat"),
                                        Ura.element("span", null, "play")))))))),
                    Ura.element("button", { className: "carousel-btn right", onclick: () => handle("right") }, ">")))))));
}
export default User;
