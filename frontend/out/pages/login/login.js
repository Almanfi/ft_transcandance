import Ura from "ura";
import Navbar from "../utils/Navbar/Navbar.js";
import Arrow from "../utils/Arrow/Arrow.js";
import Input from "../utils/Input/Input.js";
import Toast from "../utils/Toast/Toast.js";
function Login() {
    const [render, State] = Ura.init();
    const [getError, setError] = State([]);
    const logUser = async (e) => {
        e.preventDefault();
        const inputSection = document.querySelector(".login #center #input-section");
        const inputs = inputSection.querySelectorAll("input");
        const data = {};
        inputs.forEach((input) => {
            data[input.name] = input.value;
        });
        if (!data.username || !data.password) {
            setError(["username", "password"]);
            console.error("Username and password are required");
            return;
        }
        try {
            const response = await fetch("http://localhost:8000/users/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
                credentials: "include",
            });
            if (response.ok) {
                console.log("Login successful", response);
                setError([]);
                Ura.navigate("/home");
            }
            else {
                const res = await response.json();
                if (res.message) {
                    setError([res.message]);
                }
                else {
                    let arr = [];
                    Object.keys(res).forEach((key) => {
                        if (typeof res[key] === "string")
                            arr.push(res[key]);
                        else
                            arr.push(key);
                    });
                    setError([]);
                    setError(arr);
                }
            }
        }
        catch (error) {
            console.error("Error logging in:", error.message);
            setError([error.message]);
        }
    };
    return render(() => (Ura.e(Ura.f, null,
        Ura.e(Navbar, null),
        Ura.e("form", { className: "login", onsubmit: logUser },
            Ura.e("div", { id: "center" },
                Ura.e("div", { style: { position: "absolute", top: "20px" } },
                    Ura.e("loop", { on: getError() }, (e, index) => Ura.e(Toast, { message: `Invalid ${e}`, delay: index * 1 }))),
                Ura.e("div", { id: "card" },
                    Ura.e("h3", { id: "title" }, "Login"),
                    Ura.e("div", { id: "input-section" },
                        Ura.e(Input, { name: "username", value: "Username", isError: getError().includes("username") }),
                        Ura.e(Input, { name: "password", value: "Password", isError: getError().includes("password") })),
                    Ura.e("div", { id: "button-section" },
                        Ura.e("button", { id: "btn", type: "submit" },
                            Ura.e(Arrow, null))),
                    Ura.e("h4", { id: "signin", onclick: () => Ura.navigate("/signup") }, "Don't have an account?")))))));
}
export default Login;
