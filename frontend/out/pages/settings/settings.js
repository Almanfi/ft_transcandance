import Ura from 'ura';
function Settings(props = {}) {
    const [render, State] = Ura.init();
    const [getter, setter] = State(0);
    return render(() => (Ura.element("div", { className: "settings", "style-src": "./settings.css" },
        Ura.element("h1", { className: "" }, "Hello from Settings component!"),
        Ura.element("button", { className: "", onclick: () => setter(getter() + 1) },
            "Click me [",
            getter(),
            "]"))));
}
export default Settings;
