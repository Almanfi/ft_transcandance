//@ts-ignore
import Ura from 'ura';
function User(props = {}) {
    const [render, State] = Ura.init();
    const [getter, setter] = State(0);
    return render(() => (Ura.element("div", { className: "user" },
        Ura.element("h1", { className: "" }, "Hello from User component!"),
        Ura.element("button", { className: "", onclick: () => setter(getter() + 1) },
            "clique me [",
            getter(),
            "]"))));
}
export default User;
