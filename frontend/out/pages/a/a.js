import Ura from 'ura';
function A(props = {}) {
    const [render, State] = Ura.init();
    const [getter, setter] = State(0);
    return render(() => (Ura.element("div", { className: "a" },
        Ura.element("h1", { className: "" }, "Hello from A component!"),
        Ura.element("button", { className: "", onclick: () => setter(getter() + 1) },
            "clique me [",
            getter(),
            "]"))));
}
export default A;
