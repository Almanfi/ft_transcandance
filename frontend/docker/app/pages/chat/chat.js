import Ura from 'ura';
import Navbar from '../utils/Navbar/Navbar.js';
function Chat(props = {}) {
    const [render, State] = Ura.init();
    const [getter, setter] = State(0);
    return render(() => (Ura.e("div", { className: "chat" },
        Ura.e(Navbar, null),
        Ura.e("div", { className: "left" },
            Ura.e("div", { className: "up" },
                Ura.e("div", { className: "create-group" },
                    Ura.e("h4", null, "create Group"))),
            Ura.e("div", { className: "down" })),
        Ura.e("div", { className: "right" },
            Ura.e("div", { className: "up" }),
            Ura.e("div", { className: "down" })))));
}
export default Chat;
