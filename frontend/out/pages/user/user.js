import Ura from 'ura';
import Navbar from '../utils/Navbar/Navbar.jsx';
import Swords from '../utils/Swords/Swords.jsx';
import WinCup from '../utils/WinCup/WinCup.jsx';
import Award from '../utils/Award/Award.jsx';
function Carousel({ images }) {
    const [render, State] = Ura.init();
    const [getIndex, setIndex] = State(0);
    const nextSlide = () => {
        setIndex((prevIndex) => (prevIndex + 1) % images.length);
    };
    const prevSlide = () => {
        setIndex((prevIndex) => prevIndex === 0 ? images.length - 1 : prevIndex - 1);
    };
    return render(() => (Ura.element("div", { className: "carousel" },
        Ura.element("button", { className: "carousel__button carousel__button--prev", onClick: prevSlide }, "\u2190"),
        Ura.element("div", { className: "carousel__track" },
            Ura.element("loop", { on: images }, (image, index) => (Ura.element("div", { key: index, className: `carousel__slide ${index === getIndex() ? "carousel__slide--active" : ""}` },
                Ura.element("img", { src: image, alt: `Slide ${index + 1}` }))))),
        Ura.element("button", { className: "carousel__button carousel__button--next", onClick: nextSlide }, "\u2192"),
        Ura.element("div", { className: "carousel__indicators" },
            Ura.element("loop", { on: images }, (image, index) => (Ura.element("button", { key: index, className: `carousel__indicator ${index === getIndex() ? "carousel__indicator--active" : ""}`, onClick: () => setCurrentIndex(index) })))))));
}
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
            src: "https://colorlib.com/preview/theme/seogo/img/case_study/1.png",
            title: "Product Design 0", subtitle: "UI/UX, Design",
        },
        {
            src: "https://colorlib.com/preview/theme/seogo/img/case_study/1.png",
            title: "Product Design 1", subtitle: "UI/UX, Design",
        },
        {
            src: "https://colorlib.com/preview/theme/seogo/img/case_study/2.png",
            title: "Product Design 2", subtitle: "UI/UX, Design",
        },
        {
            src: "https://colorlib.com/preview/theme/seogo/img/case_study/3.png",
            title: "Product Design 3", subtitle: "UI/UX, Design",
        },
        {
            src: "https://colorlib.com/preview/theme/seogo/img/case_study/1.png",
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
                Ura.element("img", { src: "/assets/profile.png", alt: "" }),
                Ura.element("h3", null, "Hrima mohammed"))),
        Ura.element("div", { id: "bottom" },
            Ura.element("div", { id: "games" },
                Ura.element("div", { id: "history" },
                    Ura.element("h4", { id: "title" },
                        Ura.element(Swords, null),
                        " Games"),
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
                Ura.element("div", { className: "center" },
                    Ura.element("h1", null, getValue()),
                    Ura.element("div", { className: "wrapper" },
                        Ura.element("dloop", { className: "inner", on: getList(), style: {
                                transform: `translateX(-${getValue() * 10}%)`,
                                transition: "2s",
                            } }, (e, i) => (Ura.element("div", { className: "card", key: i },
                            Ura.element("div", { className: "content" },
                                Ura.element("h1", null, e.title),
                                Ura.element("h3", null, e.subtitle)))))),
                    Ura.element("button", { onclick: () => handle("left") },
                        "left ",
                        " <"),
                    Ura.element("button", { onclick: () => handle("right") },
                        "right ",
                        " >")))))));
}
export default User;
