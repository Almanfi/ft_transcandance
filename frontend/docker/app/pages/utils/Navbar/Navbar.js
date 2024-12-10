import Ura from "ura";
function Navbar() {
    const [render, State] = Ura.init();
    return render(() => (Ura.e("div", { className: "navbar" },
        Ura.e("div", { id: "logo", onclick: () => {
                Ura.navigate("/home");
            } },
            Ura.e("img", { src: "/assets/tr.png" }),
            "Clashers"),
        Ura.e("if", { cond: !Ura.store.get("user") || Ura.store.get("user") },
            Ura.e("button", { id: "login-btn", onclick: () => {
                    Ura.navigate("/login");
                } },
                Ura.e("h4", null, "Login")),
            Ura.e("button", { id: "signup-btn", onclick: () => {
                    Ura.navigate("/signup");
                } },
                Ura.e("h4", null, "Sign up"))))));
}
export default Navbar;
