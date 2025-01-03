import Ura from 'ura';
import Navbar from '../../components/Navbar/Navbar.jsx';
import { conversationGroups } from './convs.js';
import New from '../../components/create/create.jsx';
function Chat(props = {}) {
    if (!Ura.getCookie("id_key"))
        return Signup();
    const [render, State] = Ura.init();
    const [getIndex, setIndex] = State(-1);
    const [getGroup, setGroup] = State(conversationGroups);
    const [getConv, setConv] = State([]);
    const handle = (e, i) => {
        setConv(e.conversation);
        setIndex(i);
    };
    return render(() => (Ura.e("div", { className: "chat" },
        Ura.e(Navbar, null),
        Ura.e("div", { className: "left" },
            Ura.e("div", { className: "up" },
                Ura.e("div", { className: "create-group" },
                    Ura.e("h4", null, "Create Group"))),
            Ura.e("div", { className: "down" },
                Ura.e("loop", { on: getGroup() }, (e, i) => (Ura.e("div", { onclick: () => handle(e, i), className: `${getIndex() === i ? "selected" : ""}` },
                    Ura.e("h4", null,
                        "Group ",
                        e.id)))))),
        Ura.e("div", { className: "right" },
            Ura.e("loop", { on: getConv(), className: "up" }, (e) => (Ura.e("div", { className: e.user === "me" ? "mine" : "other" },
                Ura.e("p", null,
                    Ura.e("l", null, e.user),
                    ": ",
                    e.text)))),
            Ura.e("if", { cond: getConv().length },
                Ura.e("div", { className: "down" },
                    Ura.e("textarea", { name: "", id: "" }),
                    Ura.e("button", null, ">")))))));
}
export default Chat;
