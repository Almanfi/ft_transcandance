import Ura from 'ura';

function Refuse(props = {}) {
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);

  return render(() => (
    <div className="refuse">
      <h1 className="">
        Hello from Refuse component!
      </h1>
      <button className="" 
        onclick={() => setter(getter() + 1)}>
        Click me [{getter()}]
      </button>
    </div>
  ));
}

export default Refuse;
