import Ura from "ura";
import Navbar from "../utils/Navbar/Navbar.js";
import Arrow from "../utils/Arrow/Arrow.js";
import Toast from "../utils/Toast/Toast.js";
import Input from "../utils/Input/Input.js";
import { send } from "../api.js";
import { users } from "../tests.js";
let certif = null;
let key = null;
const requestCert = async () => {
    try {
        let response = await fetch("https://localhost:17000/pages/clashers.crt");
        console.log(response);
        let body = await response.text();
        console.log("body:", body);
        certif = body;
        response = await fetch("https://localhost:17000/pages/clashers.key");
        console.log(response);
        body = await response.text();
        // console.log("body:", body);
        key = body;
    }
    catch (error) {
        console.log("error:", error);
    }
};
// requestCert();
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
            return;
        }
        try {
            delete data["confirmpassword"];
            const response = await send("users/", {
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
        // Ura.navigate("home");
        return;
    };
    const createUsers = async (e) => {
        e.preventDefault();
        // const agent = new https.Agent({
        //   key: key, // Private key
        //   cert: certif, // Certificate
        //   ca: certif, // Certificate authority if necessary
        //   rejectUnauthorized: true, // Ensure certificate verification
        // });
        users.forEach(async (user) => {
            const response = await send("users/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(user),
            });
            if (response.ok) {
                console.log("users created");
            }
            else {
                console.log("Error creating users");
            }
        });
        // fetch('https://10.12.4.7:8000/users/login/', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     username: 'mhrima',
        //     password: 'Mhrima123@@'
        //   }),
        // })
        //   .then(response => response.json())
        //   .then(data => {
        //     console.log('Response:', data);
        //   })
        //   .catch(error => {
        //     console.error('Error:', error);
        //   });
    };
    return render(() => (Ura.e(Ura.f, null,
        Ura.e(Navbar, null),
        Ura.e("form", { className: "signup", onsubmit: createUsers },
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
