import Ura from "ura";
import Navbar from "../utils/Navbar/Navbar.jsx";
import Arrow from "../utils/Arrow/Arrow.jsx";
async function logUser(data) {
    try {
        const response = await fetch("http://localhost:8000/users/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            credentials: "include"
        });
        const cookieHeader = document.cookie.split("; ");
        console.log("Cookies from response headers:", cookieHeader);
    }
    catch (error) {
        console.error(error.message);
    }
}
function Login() {
    const [render, State] = Ura.init();
    const setUser = () => {
        Ura.store.set("user", { name: "mohammed" });
        Ura.navigate("/user");
    };
    return render(() => (Ura.element("div", { className: "login" },
        Ura.element(Navbar, null),
        Ura.element("div", { id: "center" },
            Ura.element("div", { id: "card" },
                Ura.element("h3", { id: "title" }, "Login"),
                Ura.element("div", { id: "input-section" },
                    Ura.element("input", { type: "text", placeholder: "Username" }),
                    Ura.element("input", { type: "password", placeholder: "Password" })),
                Ura.element("div", { id: "button-section" },
                    Ura.element("button", { id: "btn" },
                        Ura.element(Arrow, null))),
                Ura.element("h4", { id: "signin", onclick: () => {
                        Ura.navigate("/signup");
                    } }, "Don't have an account ?")),
            Ura.element("button", { onclick: setUser }, "set user")))));
}
export default Login;
