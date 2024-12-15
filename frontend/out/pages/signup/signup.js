import Ura from "ura";
import Navbar from "../utils/Navbar/Navbar.js";
import Arrow from "../utils/Arrow/Arrow.js";
import Toast from "../utils/Toast/Toast.js";
import Input from "../utils/Input/Input.js";
function Signup() {
    // if (Ura.store.get("user")) {
    //   Ura.navigate("/home")
    //   window.location.reload();
    // }
    //else
    // {
    // }
    const [render, State] = Ura.init();
    const [getError, setError] = State([]);
    const createUser = async (e) => {
        e.preventDefault();
        const inputSection = document.querySelector(".signup #center #input-section");
        const inputs = inputSection.querySelectorAll("input");
        const data = {};
        inputs.forEach((input) => {
            // console.log(`Name: ${input.name}, Value: ${input.value}`);
            data[input.name] = input.value;
        });
        console.log(data);
        if (data.password !== data.confirmpassword) {
            console.error("incompatible password");
            setError([...getError(), "password", "confirmpassword"]);
        }
        else {
            delete data["confirmpassword"];
            try {
                const response = await fetch("http://localhost:8000/users/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });
                if (response.ok) {
                    console.log("user created succefully", response);
                    setError([]);
                }
                else {
                    const res = await response.json();
                    if (res.message) {
                        setError([]);
                        setError([res.message]);
                    }
                    else if (typeof res == "object") {
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
                    else {
                    }
                    console.log(res);
                }
            }
            catch (error) {
                setError([]);
                setError([error.message]);
            }
        }
        // Ura.navigate("home");
        return;
    };
    return render(() => (Ura.e(Ura.f, null,
        Ura.e(Navbar, null),
        Ura.e("form", { className: "signup", onsubmit: createUser },
            Ura.e("div", { id: "center" },
                Ura.e("div", { style: { position: "absolute", top: "20px" } },
                    Ura.e("loop", { on: getError() }, (e, index) => (Ura.e(Toast, { message: `Invalid ${e}`, delay: index * 1 })))),
                Ura.e("div", { id: "card" },
                    Ura.e("h3", { id: "title" }, "Sign up"),
                    Ura.e("div", { id: "input-section" },
                        Ura.e(Input, { name: "firstname", value: "Firstname", isError: getError().includes("firstname") }),
                        Ura.e(Input, { name: "lastname", value: "Lastname", isError: getError().includes("lastname") }),
                        Ura.e("br", null),
                        Ura.e(Input, { name: "username", value: "User name", isError: getError().includes("username") }),
                        Ura.e(Input, { name: "display_name", value: "Display name", isError: getError().includes("display_name") }),
                        Ura.e(Input, { name: "password", value: "Password", isError: getError().includes("password") ||
                                getError().includes("confirmpassword") }),
                        Ura.e(Input, { name: "confirm password", value: "Confirm Password", isError: getError().includes("password") ||
                                getError().includes("confirmpassword") })),
                    Ura.e("div", { id: "button-section" },
                        Ura.e("button", { id: "btn", type: "submit" },
                            Ura.e(Arrow, null))),
                    Ura.e("h4", { id: "signin", onclick: () => Ura.navigate("/login") }, "Already have an account ?")))))));
}
export default Signup;
