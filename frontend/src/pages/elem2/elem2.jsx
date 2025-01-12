import Ura from 'ura';

function Elem2(props = {}) {
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);

  return render(() => (
    <root>
      <div className="elem1">
        <h1 className="">
          Hello from Elem2 component!
        </h1>
        <button className=""
          onclick={() => setter(getter() + 1)}>
          Click me [{getter()}]
        </button>
      </div>
    </root>
  ));
}

export default Elem2;
