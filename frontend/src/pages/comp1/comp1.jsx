import Ura from 'ura';
import events from '../../services/events.js';

function Comp1(props = {}) {
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);

  const handleclique = () => {
    console.log("emit click in comp1");
    events.emit("click");
  }

  return render(() => (
    <div className="comp1">
      <h1 className="">
        Hello from Comp1 component!
      </h1>
      <button className=""
        onclick={() => handleclique()}>
        Click me [{getter()}]
      </button>
    </div>
  ));
}

export default Comp1;
