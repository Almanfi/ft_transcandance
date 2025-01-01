import Ura from 'ura';
import Navbar from '../../components/Navbar/Navbar.jsx';
import Swords from '../../components/Swords/Swords.jsx';
import WinCup from '../../components/WinCup/WinCup.jsx';
import Award from '../../components/Award/Award.jsx';
import Settings from './settings/settings.jsx';
import Play from '../../components/Play/Play.jsx';
import Chat from '../../components/Chat/Chat.jsx';
import api from '../../services/api.js';
function User() {
    const [render, State] = Ura.init();
    const [getShow, setShow] = State(false);
    const [getLoading, setLoading] = State(true);
    const [getUserData, setUserData] = State({
        profile_picture: "/static/rest/images/users_profiles/default.jpg"
    });
    let user = JSON.parse(Ura.store.get("user") || "{}");
    api.getUser().then((fetchedUser) => {
        console.log("this is the response", fetchedUser);
        Ura.store.set("user", JSON.stringify(fetchedUser));
        setUserData(fetchedUser);
    })
        .catch((error) => {
        console.error("Error fetching user data:", error);
    })
        .finally(() => {
        setLoading(false); // Update loading state
    });
    const [getList, setList] = State([
        { src: "/assets/003.png", title: "user 0" },
        { src: "/assets/003.png", title: "user 1" },
        { src: "/assets/003.png", title: "user 2" },
        { src: "/assets/003.png", title: "user 3" },
        { src: "/assets/003.png", title: "user 4" }
    ]);
    console.log("hello this is user:", user);
    return render(() => (Ura.e("if", { className: "user", cond: getLoading() === false },
        Ura.e(Navbar, null),
        Ura.e(Settings, { getShow: getShow, setShow: setShow, setUserData: setUserData }),
        Ura.e("div", { id: "center" },
            Ura.e("div", { className: "user-card" },
                Ura.e("div", { className: "img-container" },
                    Ura.e("img", { src: `/api/${getUserData().profile_picture}`, alt: "", onclick: () => setShow(true) })),
                Ura.e("div", { className: "name" },
                    Ura.e("h3", null, `${getUserData().firstname} ${getUserData().lastname} (${getUserData().display_name})`)))),
        Ura.e("div", { id: "bottom" },
            Ura.e("loop", { on: [Swords, Award, WinCup], id: "games" }, (Elem) => (Ura.e("div", { id: "history" },
                Ura.e("h4", { id: "title" },
                    Ura.e(Elem, null),
                    "Games"),
                Ura.e("div", { className: "children" },
                    Ura.e("div", { className: "child" },
                        Ura.e("o", null, "42%"),
                        Ura.e("h4", null, "Pongers")),
                    Ura.e("div", { className: "child" },
                        Ura.e("o", null, "42%"),
                        Ura.e("h4", null, "Pongers")))))),
            Ura.e("div", { id: "friends" },
                Ura.e("loop", { className: "inner", on: getList() }, (e, i) => (Ura.e("div", { className: "card", key: i },
                    Ura.e("div", { className: "content" },
                        Ura.e("div", { className: "up" },
                            Ura.e("img", { src: e.src, onclick: () => Ura.navigate("/friend") }),
                            Ura.e("h4", null, e.title)),
                        Ura.e("div", { className: "down" },
                            Ura.e("span", { onclick: () => Ura.navigate("/chat") },
                                Ura.e(Chat, null)),
                            Ura.e("span", null,
                                Ura.e(Play, null))))))))))));
}
export default User;
