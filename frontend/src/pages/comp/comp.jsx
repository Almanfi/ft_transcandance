import Ura from 'ura';
import Comp0 from '../comp0/comp0.js';
import Comp1 from '../comp1/comp1.js';

function Comp(props = {}) {
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);

  return render(() => (
    <root>
      <div className="comp">
        <Comp0 />
        <Comp1 />
      </div>
    </root>
  ));
}

export default Comp;
