import Ura from 'ura';
import Elem2 from '../elem2/elem2.js';

function Elem1(props = {}) {
  return Ura.navigate("/elem2")
  // return Elem2()
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);

  return render(() => (
    <root>
    <div className="elem1">
      <h1 className="">
        Hello from Elem1 component!
      </h1>
      <button className=""
        onclick={() => setter(getter() + 1)}>
        Click me [{getter()}]
      </button>
      <button onclick={() => Ura.navigate("/elem0")}>
        navigate to Elem0
      </button>
    </div>
    </root>
  ));
}

export default Elem1;
