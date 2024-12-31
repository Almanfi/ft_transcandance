import Ura from 'ura';
import Input from '../../../components/input/Input.js';
import api from '../../../services/api.js';
function Settings(props = {}) {
    const [render, State] = Ura.init();
    let user = JSON.parse(Ura.store.get("user") || "{}");
    const [getError, setError] = State([]);
    const update = async (e) => {
        e.preventDefault();
        setError([]);
        console.log(e.target);
        const section = document.querySelector(".settings .content .card .infos");
        const inputs = section.querySelectorAll("input");
        const data = {};
        let Errors = [];
        inputs.forEach((input) => {
            // if (!input.value.length) Errors.push(input.name);
            data[input.name] = input.value;
        });
        console.log(data);
        if (!Errors.length) {
            if (data.password !== data.confirm_password)
                setError(["password", "confirmpassword"]);
            else {
                try {
                    delete data["confirmpassword"];
                    let res = await api.updateUser(data);
                    res = api.getUser();
                    console.log("settings response");
                    console.table(res);
                    props.setUserData(res);
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
    return render(() => (Ura.e("if", { cond: props.getShow(), className: `settings ${props.getShow() ? "" : "hidden"}` },
        Ura.e("span", { className: "close", onclick: () => props.setShow(!props.getShow()) }, "X"),
        Ura.e("form", { className: "content", onsubmit: update },
            Ura.e("div", { className: "img" },
                Ura.e("img", { src: `/api/${user.profile_picture}`, alt: "", className: "img" })),
            Ura.e("div", { className: "card" },
                Ura.e("div", { className: "infos" },
                    Ura.e(Input, { value: "firstname", isError: getError().includes("firstname") }),
                    Ura.e(Input, { value: "lastname", isError: getError().includes("lastname") }),
                    Ura.e("br", null),
                    Ura.e(Input, { value: "display name", isError: getError().includes("display_name") }),
                    Ura.e(Input, { value: "password", isError: getError().includes("password") ||
                            getError().includes("confirmpassword") }),
                    Ura.e(Input, { value: "confirm password", isError: getError().includes("password") ||
                            getError().includes("confirmpassword") }))),
            Ura.e("button", { type: "submit" },
                Ura.e("b", null, "Save"))))));
}
export default Settings;
