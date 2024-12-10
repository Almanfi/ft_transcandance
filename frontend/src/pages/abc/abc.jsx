import Ura from 'ura';

function Abc(props = {}) {
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);

  return render(() => (
    <div className="abc">
      <h1 className="">
        Hello from Abc component!
      </h1>
      <button className="" 
        onclick={() => setter(getter() + 1)}>
        Click me [{getter()}]
      </button>
    </div>
  ));
}

export default Abc;
