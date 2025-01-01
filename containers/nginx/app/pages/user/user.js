import Ura from 'ura';
import Navbar from '../../components/Navbar/Navbar.jsx';
import Swords from '../../components/Swords/Swords.jsx';
import WinCup from '../../components/WinCup/WinCup.jsx';
import Award from '../../components/Award/Award.jsx';
import Settings from './settings/settings.jsx';
import Play from '../../components/Play/Play.jsx';
import Chat from '../../components/Chat/Chat.jsx';
import api from '../../services/api.js';
import Toast from '../../components/Toast/Toast.jsx';
function User() {
    const [render, State] = Ura.init();
    const [getShow, setShow] = State(false);
    const [getLoading, setLoading] = State(true);
    const [getUserData, setUserData] = State({
        firstname: "",
        lastname: "",
        display_name: "",
        profile_picture: "/static/rest/images/users_profiles/profile.jpg"
    });
    const fetchData = async () => {
        const Errors = [];
        try {
            const res = await api.getUser();
            console.log("response:", res);
            setUserData(res);
            console.log("img path", getUserData().profile_picture);
            const img = await api.getPicture(getUserData().profile_picture);
            console.log(img);
            // setImage(`https://localhost:5000/${getUserData().profile_picture}`);
        }
        catch (err) {
            console.error("err", err);
            if (err.message)
                Errors.push(err.message);
            else if (typeof err == "object") {
                Object.keys(err).forEach((key) => {
                    if (typeof err[key] === "string")
                        Errors.push(err[key]);
                    else if (err[key].length && typeof err[key][0] === "string")
                        err[key].forEach(elem => Errors.push(`${elem} (${key})`));
                    else
                        Errors.push(key);
                });
            }
        }
        Errors.forEach((e, i) => Ura.create(Ura.e(Toast, { message: e, delay: i })));
    };
    fetchData();
    const [getList, setList] = State([
        { src: "/assets/003.png", title: "user 0" },
        { src: "/assets/003.png", title: "user 1" },
        { src: "/assets/003.png", title: "user 2" },
        { src: "/assets/003.png", title: "user 3" },
        { src: "/assets/003.png", title: "user 4" }
    ]);
    console.log("hello this is user:", getUserData());
    return render(() => (Ura.e("if", { className: "user", cond: getLoading() === true },
        Ura.e(Navbar, null),
        Ura.e(Settings, { getShow: getShow, setShow: setShow, setUserData: setUserData }),
        Ura.e("div", { id: "center" },
            Ura.e("div", { className: "user-card" },
                Ura.e("div", { className: "img-container" },
                    Ura.e("img", { src: `${api.endpoint}${getUserData().profile_picture}`, alt: "", onclick: () => setShow(true) })),
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
