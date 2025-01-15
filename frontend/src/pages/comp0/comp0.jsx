import Ura from 'ura';
import events from '../../services/events.js';

function Comp0(props = {}) {
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);

  events.addChild("click", "child.click", () => {
    console.log("call click in 0");
    setter(getter() + 1)
  })

  return render(() => (
    <div className="comp0">
      <h1 className="">
        Hello from Comp0 component!
      </h1>
      <button className=""
        onclick={() => setter(getter() + 1)}>
        Click me [{getter()}]
      </button>
    </div>
  ));
}

export default Comp0;
