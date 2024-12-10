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
    return render(() => (Ura.e("div", { className: "login" },
        Ura.e(Navbar, null),
        Ura.e("div", { id: "center" },
            Ura.e("div", { id: "card" },
                Ura.e("h3", { id: "title" }, "Login"),
                Ura.e("div", { id: "input-section" },
                    Ura.e("input", { type: "text", placeholder: "Username" }),
                    Ura.e("input", { type: "password", placeholder: "Password" })),
                Ura.e("div", { id: "button-section" },
                    Ura.e("button", { id: "btn" },
                        Ura.e(Arrow, null))),
                Ura.e("h4", { id: "signin", onclick: () => {
                        Ura.navigate("/signup");
                    } }, "Don't have an account ?")),
            Ura.e("button", { onclick: setUser }, "set user")))));
}
export default Login;
