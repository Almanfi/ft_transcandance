import Ura from "ura";
import Navbar from "../utils/Navbar/Navbar.jsx";
// Ura.loadCSS("./home.css")
// import style from "./home.css"
// console.log(style);
function Home() {
    const [render, State] = Ura.init();
    const [getter, setter] = State(0);
    // if (!Ura.store.get("user")) {
    //   Ura.navigate("/login")
    //   window.location.reload();
    // }
    // else
    return render(() => (Ura.e("div", { className: "home" },
        Ura.e(Navbar, null),
        Ura.e("div", { id: "center" },
            Ura.e("h1", null,
                "Join Your ",
                Ura.e("b", null, "Friends")),
            Ura.e("h1", null, "and"),
            Ura.e("h1", null,
                Ura.e("o", null, "Beat"),
                " them")),
        Ura.e("div", { id: "bottom" },
            Ura.e("button", { onclick: () => Ura.navigate("/user") },
                Ura.e("h3", null, "Enter the Arena"))))));
}
export default Home;
