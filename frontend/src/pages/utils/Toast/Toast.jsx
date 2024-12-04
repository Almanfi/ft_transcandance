import Ura from 'ura';

function Toast({ message, delay }) {
  const [render, State] = Ura.init();

  return render(() => (
    <div
      className="utils-toast"
      style={{
        animationDelay: `${delay}s`,
      }}
    >
      <h4>Error: {message}</h4>
    </div>
  ));
}
export default Toast;
