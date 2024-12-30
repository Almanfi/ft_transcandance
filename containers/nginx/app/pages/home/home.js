import Ura from "ura";
import Navbar from "../utils/Navbar/Navbar.jsx";
function Home(props) {
    const [render, State] = Ura.init();
    const [getter, setter] = State(0);
    console.log(props);
    // if (!Ura.store.get("user")) {
    //   Ura.navigate("/login")
    //   window.location.reload();
    // }
    // else
    return render(() => (Ura.e("div", { className: "home" })));
}
export default Home;

import "./dir/index.js"