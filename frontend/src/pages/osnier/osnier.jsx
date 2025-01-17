import Ura from 'ura';

function Osnier(props = {}) {
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);

  return render(() => (
    <div className="osnier">
      <h1 className="">
        Hello from Osnier component!
      </h1>
      <button className="" 
        onclick={() => setter(getter() + 1)}>
        Click me [{getter()}]
      </button>
    </div>
  ));
}

export default Osnier;
