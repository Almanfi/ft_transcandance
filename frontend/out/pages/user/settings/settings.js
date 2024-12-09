import Ura from 'ura';
function Settings(props = {}) {
    const [render, State] = Ura.init();
    const [getter, setter] = State(0);
    return render(() => (Ura.element("div", { className: "settings" },
        Ura.element("h1", { className: "" }, "hhff Hello from Settings component!"))));
}
export default Settings;
