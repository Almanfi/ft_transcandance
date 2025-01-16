import Ura from 'ura';

function Toast({ message, delay = 1, color = "red", handler = null }) {
  const [render] = Ura.init();
  if (!handler) handler = () => { }
  return render(() => (
    <root>
      <div className="utils-toast" style={{ animationDelay: `${delay}s`, backgroundColor: color }} onclick={handler}>
        <h4>{message}</h4>
      </div>
    </root>
  ));
}
export default Toast;
