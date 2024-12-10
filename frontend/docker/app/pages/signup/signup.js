import Ura from "ura";
import Navbar from "../utils/Navbar/Navbar.jsx";
import Arrow from "../utils/Arrow/Arrow.jsx";
import Toast from "../utils/Toast/Toast.jsx";
async function CreateUser(data) {
    try {
        const response = await fetch("http://localhost:8000/users/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (response.ok)
            console.log("user created succefully", response);
    }
    catch (error) {
        console.error(error.message);
    }
}
function Input({ name, value, isError }) {
    const [render, State] = Ura.init();
    const placeholder = value.charAt(0).toUpperCase() + value.slice(1);
    console.log(value);
    return render(() => (Ura.e("input", { name: name.replace(" ", ""), type: value.split(" ").includes("Password") ? "password" : "text", placeholder: placeholder, className: isError ? "is-error" : "" })));
}
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
    // if (form.confirmPassword.value !== form.password.value) {
    //   console.log("not compatible passwords");
    // }
    // else {
    //   // const data = {
    //   //   firstname: form.firstname.value,
    //   //   lastname: form.lastname.value,
    //   //   username: form.username.value,
    //   //   password: form.password.value,
    //   //   confirmPassword: form.confirmPassword.value,
    //   // };
    //   // console.log("create", data);;
    //   // for (const element of form.elements) {
    //   //   console.log(`Name: ${element.name}, Type: ${element.type}, Value: ${element.value}`);
    //   // }
    // }
    const create = async (e) => {
        Ura.navigate("home");
        return;
        e.preventDefault();
        // CreateUser({
        //   firstname: "user1", lastname: "user1",
        //   username: "user1", password: "User123@@", display_name: "user1"
        // })
        const inputSection = document.querySelector('.signup #center #input-section');
        const inputs = inputSection.querySelectorAll('input');
        const data = {};
        setError([]);
        inputs.forEach(input => {
            console.log(`Name: ${input.name}, Value: ${input.value}`);
            data[input.name] = input.value;
        });
        console.log("data:", data);
        if (data.password !== data.confirmpassword) {
            console.error("incompatible password");
            setError([...getError(), "password", "confirmpassword"]);
        }
        else {
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
                // else if(response.status == 401)
            }
            catch (error) {
                console.error(error.message);
            }
        }
    };
    return render(() => (Ura.e("form", { className: "signup", onsubmit: create },
        Ura.e(Navbar, null),
        Ura.e("div", { id: "center" },
            Ura.e("div", { style: { position: "absolute", top: "20px" } },
                Ura.e("loop", { on: getError() }, (e, index) => (Ura.e(Toast, { message: `Invalid ${e}`, delay: index * 1 })))),
            Ura.e("div", { id: "card" },
                Ura.e("h3", { id: "title" }, "Sign up"),
                Ura.e("div", { id: "input-section" },
                    Ura.e(Input, { name: "firstname", value: "Firstname", isError: getError().includes("firstname") }),
                    Ura.e(Input, { name: "lastname", value: "Lastname", isError: getError().includes("lastname") }),
                    Ura.e("br", null),
                    Ura.e(Input, { name: "username", value: "Username", isError: getError().includes("username") }),
                    Ura.e(Input, { name: "password", value: "Password", isError: getError().includes("password") }),
                    Ura.e(Input, { name: "confirm password", value: "Confirm Password", isError: getError().includes("confirmpassword") })),
                Ura.e("div", { id: "button-section" },
                    Ura.e("button", { id: "btn", type: "submit" },
                        Ura.e(Arrow, null))),
                Ura.e("h4", { id: "signin", onclick: () => Ura.navigate("/login") }, "Already have an account ?"))))));
}
export default Signup;
