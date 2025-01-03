import Ura from "ura";
import Navbar from "../../components/Navbar/Navbar.jsx";
import Arrow from "../../components/Arrow/Arrow.jsx";
import Toast from "../../components/Toast/Toast.jsx";
import Input from "../../components/input/Input.jsx";
import api from "../../services/api.js";
import Home from "../home/home.jsx";
function truncateString(str) {
    if (str.length > 17)
        return str.substring(0, 14) + '...';
    return str;
}
function Signup() {
    const [render, State] = Ura.init();
    const [getPath, setPath] = State("");
    const [getImage, setImage] = State(null);
    const uploadImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPath(file.name);
        }
    };
    const createUser = async (e) => {
        e.preventDefault();
        const Errors = [];
        const section = document.querySelector(".signup #center #input-section");
        const inputs = section.querySelectorAll("input");
        const data = {};
        inputs.forEach((input) => {
            if (input.value.length)
                data[input.name] = input.value;
            else
                Errors.push(`empty ${input.name} field`);
        });
        if (!Errors.length) {
            if (data.password !== data.confirm_password)
                Errors.push("Password and Confirm Password do not match");
            else {
                try {
                    delete data["confirmpassword"];
                    const formData = new FormData();
                    Object.keys(data).forEach((key) => {
                        formData.append(key, data[key]);
                    });
                    const image = getImage();
                    if (image && image instanceof File) {
                        console.log("Appending the image:", image);
                        formData.append("profile_picture", image, "random.png");
                    }
                    else {
                        console.log("No image or invalid image:", image);
                    }
                    console.log("send", formData);
                    const res = await api.signup(formData);
                    console.log("signup response");
                    console.table(res);
                    /*
                      display_name, firstname, id
                      lastname, profile_picture, username
                    */
                    //  Ura.store.set("user", JSON.stringify(res));
                    Ura.navigate("/login");
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
        }
        Errors.forEach((e, i) => Ura.create(Ura.e(Toast, { message: e, delay: i })));
    };
    return render(() => (Ura.e(Ura.fr, null,
        Ura.e(Navbar, null),
        Ura.e("form", { className: "signup", onsubmit: createUser },
            Ura.e("div", { id: "center" },
                Ura.e("div", { id: "card" },
                    Ura.e("h3", { id: "title" }, "Sign up"),
                    Ura.e("label", { htmlFor: "fileInput", className: "file-input-label" },
                        "Load Image ",
                        truncateString(getPath())),
                    Ura.e("input", { type: "file", id: "fileInput", accept: "image/*", onchange: uploadImage, hidden: true }),
                    Ura.e("div", { id: "input-section" },
                        Ura.e(Input, { value: "firstname" }),
                        Ura.e(Input, { value: "lastname" }),
                        Ura.e("br", null),
                        Ura.e(Input, { value: "username" }),
                        Ura.e(Input, { value: "display name" }),
                        Ura.e(Input, { value: "password" }),
                        Ura.e(Input, { value: "confirm password" })),
                    Ura.e("div", { id: "button-section" },
                        Ura.e("button", { id: "btn", type: "submit" },
                            Ura.e(Arrow, null))),
                    Ura.e("h4", { id: "signin", onclick: () => Ura.navigate("/login") }, "Already have an account ?")))))));
}
export default Signup;
