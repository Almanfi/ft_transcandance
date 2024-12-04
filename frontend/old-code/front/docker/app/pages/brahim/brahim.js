import Ura from 'ura';
function Brahim() {
    const [render, State] = Ura.init();
    const [getter, setter] = State(0);
    return render(() => (Ura.element("div", { className: "brahim" },
        Ura.element("h1", null, "Hello from Brahim component!"),
        Ura.element("button", { onclick: () => setter(getter() + 1) },
            "clique me [",
            getter(),
            "]"))));
}
export default Brahim;
