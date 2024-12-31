import Ura from "ura";
import Navbar from "../../components/Navbar/Navbar.jsx";
import Arrow from "../../components/Arrow/Arrow.jsx";
import Toast from "../../components/Toast/Toast.jsx";
import Input from "../../components/input/Input.jsx";
import api from "../../services/api.js";
function Signup() {
    const [render, State] = Ura.init();
    const [getError, setError] = State([]);
    const [getInvalid, setInvalid] = State([]);
    const createUser = async (e) => {
        e.preventDefault();
        setError([]);
        const section = document.querySelector(".signup #center #input-section");
        const inputs = section.querySelectorAll("input");
        const data = {};
        let Errors = [];
        inputs.forEach((input) => {
            // if (!input.value.length) Errors.push(input.name);
            data[input.name] = input.value;
        });
        if (!Errors.length) {
            if (data.password !== data.confirm_password)
                setError(["password", "confirmpassword"]);
            else {
                try {
                    delete data["confirmpassword"];
                    const res = await api.Signup(data);
                    console.log("signup response");
                    console.table(res);
                    /*
                    display_name
                    firstname
                    id
                    lastname
                    profile_picture
                    username
                    */
                    Ura.store.set("user", JSON.stringify(res));
                }
                catch (err) {
                    console.log("err", err);
                    if (err.message)
                        setError([err.message]);
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
        }
        if (Errors.length) {
            setError(Errors);
            return;
        }
    };
    return render(() => (Ura.e(Ura.fr, null,
        Ura.e(Navbar, null),
        Ura.e("form", { className: "signup", onsubmit: createUser },
            Ura.e("div", { id: "center" },
                Ura.e("h1", null, "add upload image"),
                Ura.e("div", { style: { position: "absolute", top: "20px" } },
                    Ura.e("loop", { on: getError() }, (e, index) => (Ura.e(Toast, { message: `${e}`, delay: index * 1 })))),
                Ura.e("div", { id: "card" },
                    Ura.e("h3", { id: "title" }, "Sign up"),
                    Ura.e("div", { id: "input-section" },
                        Ura.e(Input, { value: "firstname", isError: getError().includes("firstname") }),
                        Ura.e(Input, { value: "lastname", isError: getError().includes("lastname") }),
                        Ura.e("br", null),
                        Ura.e(Input, { value: "username", isError: getError().includes("username") }),
                        Ura.e(Input, { value: "display name", isError: getError().includes("display_name") }),
                        Ura.e(Input, { value: "password", isError: getError().includes("password") ||
                                getError().includes("confirmpassword") }),
                        Ura.e(Input, { value: "confirm password", isError: getError().includes("password") ||
                                getError().includes("confirmpassword") })),
                    Ura.e("div", { id: "button-section" },
                        Ura.e("button", { id: "btn", type: "submit" },
                            Ura.e(Arrow, null))),
                    Ura.e("h4", { id: "signin", onclick: () => Ura.navigate("/login") }, "Already have an account ?")))))));
}
export default Signup;
