import Ura from "ura";
import Navbar from "../../components/Navbar/Navbar.jsx";
import Arrow from "../../components/Arrow/Arrow.jsx";
import Input from "../../components/input/Input.jsx";
import Toast from "../../components/Toast/Toast.jsx";
import api from "../../services/api.js";
// console.log(document.cookie);
// logUser0();
function Login() {
    const [render, State, ForcedState] = Ura.init();
    const [getError, setError] = ForcedState([]);
    const logUser = async (e) => {
        e.preventDefault();
        const inputSection = document.querySelector(".login #center #input-section");
        const inputs = inputSection.querySelectorAll("input");
        const data = {};
        let Errors = [];
        inputs.forEach((input) => {
            data[input.name] = input.value;
        });
        if (!Errors.length) {
            console.log("log with ", data);
            try {
                let res = await api.Login(data);
                console.log("login response");
                res = await api.getUser();
                console.table(res);
                /*
                display_name, firstname, id
                lastname, profile_picture, username
                */
                Ura.store.set("user", JSON.stringify(res));
            }
            catch (err) {
                console.log("err", err);
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
        }
        console.log("errors:", Errors);
        if (Errors.length) {
            setError(Errors);
            return;
        }
    };
    return render(() => (Ura.e(Ura.fr, null,
        Ura.e(Navbar, null),
        Ura.e("form", { className: "login", onsubmit: logUser },
            Ura.e("div", { id: "center" },
                Ura.e("div", { style: { position: "absolute", top: "20px" } },
                    Ura.e("loop", { on: getError() }, (e, index) => Ura.e(Toast, { message: `${e}`, delay: index * 1 }))),
                Ura.e("div", { id: "card" },
                    Ura.e("h3", { id: "title" }, "Login"),
                    Ura.e("div", { id: "input-section" },
                        Ura.e(Input, { value: "username", isError: getError().includes("username") }),
                        Ura.e(Input, { value: "password", isError: getError().includes("password") ||
                                getError().includes("confirmpassword") })),
                    Ura.e("div", { id: "button-section" },
                        Ura.e("button", { id: "btn", type: "submit" },
                            Ura.e(Arrow, null))),
                    Ura.e("h4", { id: "signin", onclick: () => Ura.navigate("/signup") }, "Don't have an account?")))))));
}
export default Login;
