import Ura from "ura";
import Menu from "../Menu/Menu.js";
function Navbar() {
    const [render, State] = Ura.init();
    const [getShow, setShow] = State(false);
    const handleClique = () => setShow(!getShow());
    return render(() => (Ura.e("div", { className: "navbar" },
        Ura.e("div", { id: "logo", onclick: () => { Ura.navigate("/home"); } },
            Ura.e("img", { src: "/assets/tr.png" }),
            "Clashers"),
        Ura.e("input", { type: "text", placeholder: "Search.." }),
        Ura.e("button", { className: "show-navbar", onclick: handleClique },
            Ura.e(Menu, null)),
        Ura.e("if", { cond: !Ura.store.get("user") || Ura.store.get("user"), className: `toogle-bar-${getShow() ? "show" : "hidden"}` },
            Ura.e("button", { id: "login-btn", onclick: () => { Ura.navigate("/login"); } },
                Ura.e("h4", null, "Login")),
            Ura.e("button", { id: "signup-btn", onclick: () => { Ura.navigate("/signup"); } },
                Ura.e("h4", null, "Sign up"))))));
}
export default Navbar;
/*
   @media (min-width: 1025px) {
        & .inner {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      @media (min-width: 1025px) {
        & .inner {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      @media (min-width: 1025px) {
        & .inner {
          grid-template-columns: repeat(3, 1fr);
        }
      }


*/ 
