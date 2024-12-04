import Ura from "ura";
import Navbar from "../utils/Navbar/Navbar.jsx";
import Arrow from "../utils/Arrow/Arrow.jsx";
async function CreateUser(data) {
    try {
        const response = await Ura.send("POST", "http://localhost:8000/users/", {}, data);
        if (response.status != 201)
            console.error("Error creating user");
        else
            console.log("response", response);
    }
    catch (error) {
        console.error("Error:", error.message);
    }
}
async function LogUser(data) {
    try {
        const response = await Ura.send("POST", "http://localhost:8000/users/login/", {}, data);
        if (response.status != 200)
            console.error("Error login user");
        else
            console.log("Login successful:", response);
    }
    catch (error) {
        console.error("Error:", error.message);
    }
}
function Signup() {
    const [render, State] = Ura.init();
    const [getCheck, setCheck] = State(true);
    const checkbox = (e) => {
        e.preventDefault();
        setCheck(e.target.checked);
    };
    const create = async () => {
        CreateUser({
            firstname: "user2", lastname: "user2",
            username: "user2_", password: "User123@@", display_name: "_user22"
        });
    };
    const login = async () => {
        LogUser({ username: "user2_", password: "User123@@" });
    };
    return render(() => (Ura.element("div", { className: "signup" },
        Ura.element(Navbar, null),
        Ura.element("div", { id: "center" },
            Ura.element("div", { id: "card" },
                Ura.element("h3", { id: "title" }, "Sign up"),
                Ura.element("div", { id: "input-section" },
                    Ura.element("input", { type: "text", placeholder: "Firstname" }),
                    Ura.element("input", { type: "text", placeholder: "Lastname" }),
                    Ura.element("br", null),
                    Ura.element("input", { type: "text", placeholder: "Username" }),
                    Ura.element("input", { type: "password", placeholder: "Password" }),
                    Ura.element("input", { type: "password", placeholder: "Confirm Password" })),
                Ura.element("div", { id: "button-section" },
                    Ura.element("button", { id: "btn", onclick: login },
                        Ura.element(Arrow, null))),
                Ura.element("h4", { id: "signin", onclick: () => {
                        Ura.navigate("/login");
                    } }, "Already have an account ?"))))));
}
export default Signup;
