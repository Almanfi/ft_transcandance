import Ura from 'ura';
function Abc(props = {}) {
    const [render, State] = Ura.init();
    const [getter, setter] = State(0);
    return render(() => (Ura.e("div", { className: "abc" },
        Ura.e("h1", { className: "" }, "Hello from Abc component!"),
        Ura.e("button", { className: "", onclick: () => setter(getter() + 1) },
            "Click me [",
            getter(),
            "]"))));
}
export default Abc;
