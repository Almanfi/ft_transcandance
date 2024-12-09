import Ura from 'ura';
function Toast({ message, delay }) {
    const [render, State] = Ura.init();
    return render(() => (Ura.element("div", { className: "utils-toast", style: {
            animationDelay: `${delay}s`,
        } },
        Ura.element("h4", null,
            "Error: ",
            message))));
}
export default Toast;
