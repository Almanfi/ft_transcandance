import Ura from 'ura';
function Input({ value, isError }) {
    const [render, State] = Ura.init();
    const placeholder = value.charAt(0).toUpperCase() + value.slice(1);
    return render(() => (Ura.e("input", { name: value.replace(" ", "_"), type: value.split(" ").includes("password") ? "password" : "text", placeholder: placeholder })));
}
export default Input;
