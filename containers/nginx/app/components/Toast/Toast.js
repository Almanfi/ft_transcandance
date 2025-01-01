import Ura from 'ura';
function Toast({ message, delay }) {
    const [render] = Ura.init();
    return render(() => (Ura.e("root", null,
        Ura.e("div", { className: "utils-toast", style: { animationDelay: `${delay}s`, } },
            Ura.e("h4", null,
                "Error: ",
                message)))));
}
export default Toast;
