import Ura from 'ura';
function Settings(props = {}) {
    const [render, State] = Ura.init();
    const [getter, setter] = State(0);
    return render(() => (Ura.e("div", { className: "settings" },
        Ura.e("div", { className: "card" },
            Ura.e("img", { src: "", alt: "" })))));
}
export default Settings;
