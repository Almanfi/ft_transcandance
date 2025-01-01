import Ura from 'ura';

function Toast({ message, delay }) {
  const [render] = Ura.init();

  return render(() => (
    <root>
      <div className="utils-toast" style={{ animationDelay: `${delay}s`, }}>
        <h4>Error: {message}</h4>
      </div>
    </root>
  ));
}
export default Toast;
