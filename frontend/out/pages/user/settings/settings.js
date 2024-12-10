import Ura from 'ura';
function Settings(props = {}) {
    const [render, State] = Ura.init();
    const [getter, setter] = State(0);
    return render(() => (Ura.e("div", { className: "settings" },
        Ura.e("div", { className: "content" },
            Ura.e("div", { className: "img" }, "ffff"),
            Ura.e("div", { className: "card" },
                Ura.e("div", { className: "infos" },
                    Ura.e("input", { type: "text", placeholder: "First name" }),
                    Ura.e("input", { type: "text", placeholder: "Last name" }),
                    Ura.e("input", { type: "email", placeholder: "Email" }),
                    Ura.e("input", { type: "email", placeholder: "Confirm Email" }),
                    Ura.e("input", { type: "password", placeholder: "Password" }),
                    Ura.e("input", { type: "password", placeholder: "Confirm Password" }))),
            Ura.e("button", null,
                Ura.e("b", null, "Save"))))));
}
export default Settings;
