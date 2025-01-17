import Ura from 'ura';

function Pong(props = {}) {
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);

  return render(() => (
    <div className="pong">
      <h1 className="">
        Hello from Pong component!
      </h1>
      <button className="" 
        onclick={() => setter(getter() + 1)}>
        Click me [{getter()}]
      </button>
    </div>
  ));
}

export default Pong;
