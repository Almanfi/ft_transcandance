import Ura from "ura";
import Navbar from "../../components/Navbar/Navbar.jsx";
import Arrow from "../../components/Arrow/Arrow.jsx";
import Input from "../../components/input/Input.jsx";
import Toast from "../../components/Toast/Toast.jsx";
import api from "../../services/api.js";
function Login() {
    const [render] = Ura.init();
    const logUser = async (e) => {
        e.preventDefault();
        const Errors = [];
        const inputSection = document.querySelector(".login #center #input-section");
        const inputs = inputSection.querySelectorAll("input");
        const data = {};
        inputs.forEach((input) => {
            if (input.value.length)
                data[input.name] = input.value;
            else
                Errors.push(`empty ${input.name} field`);
        });
        if (!Errors.length) {
            console.log("log with ", data);
            try {
                const res = await api.Login(data);
                console.log("login response");
                // console.table(res)
                // res = await api.getUser();
                /*
                display_name, firstname, id
                lastname, profile_picture, username
                */
                // Ura.store.set("user", JSON.stringify(res));
                Ura.navigate("/home");
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
            Errors.forEach((e, i) => Ura.create(Ura.e(Toast, { message: e, delay: i })));
            return;
        }
    };
    return render(() => (Ura.e(Ura.fr, null,
        Ura.e(Navbar, null),
        Ura.e("form", { className: "login", onsubmit: logUser },
            Ura.e("div", { id: "center" },
                Ura.e("div", { id: "card" },
                    Ura.e("h3", { id: "title" }, "Login"),
                    Ura.e("div", { id: "input-section" },
                        Ura.e(Input, { value: "username" }),
                        Ura.e(Input, { value: "password" })),
                    Ura.e("div", { id: "button-section" },
                        Ura.e("button", { id: "btn", type: "submit" },
                            Ura.e(Arrow, null))),
                    Ura.e("h4", { id: "signin", onclick: () => Ura.navigate("/signup") }, "Don't have an account?")))))));
}
export default Login;
