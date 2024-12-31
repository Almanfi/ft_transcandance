import Ura from 'ura';
function Create(props = {}) {
    const [render, State] = Ura.init();
    return render(() => (Ura.e("div", { className: "new" },
        Ura.e("input", { type: "text", placeholder: "groups name" }),
        Ura.e("div", { className: "members" }),
        Ura.e("input", { type: "text", placeholder: "members" }),
        Ura.e("button", null, "create conversation"))));
}
export default Create;
