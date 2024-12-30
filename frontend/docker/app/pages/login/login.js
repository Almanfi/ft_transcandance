import Ura from "ura";
import Navbar from "../utils/Navbar/Navbar.js";
import Arrow from "../utils/Arrow/Arrow.js";
import Input from "../utils/Input/Input.js";
import Toast from "../utils/Toast/Toast.js";
import { send } from "../api.js";
import { users } from "../tests.js";
console.log(document.cookie);
const logUser0 = async () => {
    // e.preventDefault();
    try {
        const response = await send("users/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(users[0]),
            credentials: "include", // Include credentials for cookies
        });
        console.log("Response Headers:");
        for (let [key, value] of response.headers.entries()) {
            console.log(`${key}: ${value}`);
        }
        if (response.ok) {
            const data = await response.json();
            console.log("Response Body:");
            console.log(data);
            console.log("Cookies:", document.cookie); // Note: Only non-HttpOnly cookies appear
        }
        else {
            console.log("User failed to log in");
            const errorText = await response.text();
            console.log("Response Body (Error):");
            console.log(errorText);
        }
    }
    catch (error) {
        console.error("Error during request:", error);
    }
};
// logUser0();
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
            const response = await send("users/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
                // credentials: "include",
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
    const logUser0 = async (e) => {
        e.preventDefault();
        console.log("hello");
        document.cookie = "username=John-Doe";
        try {
            const response = await send("users/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(users[0]),
                credentials: "include", // Include credentials for cookies
            });
            console.log("Response Headers:");
            for (let [key, value] of response.headers.entries()) {
                console.log(`${key}: ${value}`);
            }
            if (response.ok) {
                const data = await response.json();
                console.log("Response Body:");
                console.log(data);
                console.log("Cookies:", document.cookie); // Note: Only non-HttpOnly cookies appear
            }
            else {
                console.log("User failed to log in");
                const errorText = await response.text();
                console.log("Response Body (Error):");
                console.log(errorText);
            }
        }
        catch (error) {
            console.error("Error during request:", error);
        }
    };
    return render(() => (Ura.e(Ura.f, null,
        Ura.e(Navbar, null),
        Ura.e("form", { className: "login", onsubmit: logUser0 },
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
