import Ura from 'ura';

function Toast({ message, delay = 1, color = "red" }) {
  const [render] = Ura.init();

  return render(() => (
    <root>
      <div className="utils-toast" style={{ animationDelay: `${delay}s`, backgroundColor: color }}>
        <h4>{message}</h4>
      </div>
    </root>
  ));
}
export default Toast;
