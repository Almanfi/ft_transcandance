import Ura from 'ura';

function Elem0(props = {}) {
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);

  return render(() => (
    <root>
      <div className="elem0">
        <h1 className="">
          Hello from Elem0 component!
        </h1>
        <button className=""
          onclick={() => setter(getter() + 1)}>
          Click me [{getter()}]
        </button>
        <button onclick={() => Ura.navigate("/elem1")}>
          navigate to Elem1
        </button>
      </div>
    </root>
  ));
}

export default Elem0;
