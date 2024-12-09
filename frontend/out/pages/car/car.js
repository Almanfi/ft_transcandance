import Ura from 'ura';
function Car(props = {}) {
    const [render, State] = Ura.init();
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
    return render(() => (Ura.element("div", { className: "center" },
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
            " >"))));
}
export default Car;
