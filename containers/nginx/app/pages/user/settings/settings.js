import Ura from 'ura';
import Input from '../../../components/input/Input.js';
import api from '../../../services/api.js';
function Settings(props = {}) {
    const { getShow, setShow, userData } = props;
    const [render, State] = Ura.init();
    // let user = JSON.parse(Ura.store.get("user") || "{}");
    const [getError, setError] = State([]);
    const [getUserData, setUserData] = userData;
    const update = async (e) => {
        e.preventDefault();
        console.log(e.target);
        const section = document.querySelector(".settings .content .card .infos");
        const inputs = section.querySelectorAll("input");
        const data = {};
        const Errors = [];
        inputs.forEach((input) => {
            // if (!input.value.length) Errors.push(input.name);
            if (input.value.length)
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
                    res = await api.getUser();
                    console.log("settings response");
                    console.table(res);
                    setUserData(res);
                    /*
                    display_name
                    firstname
                    id
                    lastname
                    profile_picture
                    username
                    */
                    //  Ura.store.set("user", JSON.stringify(res));
                    setShow(false);
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
        Errors.forEach((e, i) => Ura.create(Ura.e(Toast, { message: e, delay: i })));
    };
    const handleDelete = async (e) => {
        const Errors = [];
        try {
            e.preventDefault();
            await api.deleteUser();
            Ura.navigate("/home");
        }
        catch (error) {
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
        Errors.forEach((e, i) => Ura.create(Ura.e(Toast, { message: e, delay: i })));
    };
    return render(() => (Ura.e("if", { cond: getShow(), className: `settings ${getShow() ? "" : "hidden"}` },
        Ura.e("span", { className: "close", onclick: () => setShow(!getShow()) }, "X"),
        Ura.e("form", { className: "content", onsubmit: update },
            Ura.e("div", { className: "img" },
                Ura.e("img", { src: `/api/${getUserData().profile_picture}`, alt: "", className: "img" })),
            Ura.e("div", { className: "card" },
                Ura.e("div", { className: "infos" },
                    Ura.e(Input, { value: "firstname" }),
                    Ura.e(Input, { value: "lastname" }),
                    Ura.e("br", null),
                    Ura.e(Input, { value: "display name" }),
                    Ura.e(Input, { value: "password" }),
                    Ura.e(Input, { value: "confirm password" }))),
            Ura.e("button", { onclick: handleDelete }, "Delete account"),
            Ura.e("button", { type: "submit" },
                Ura.e("b", null, "Save"))))));
}
export default Settings;
