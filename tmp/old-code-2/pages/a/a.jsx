import Ura from 'ura';

function A(props = {}) {
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);

  return render(() => (
    <div className="a">
      <h1 className="">
        Hello from A component!
      </h1>
      <button className="" onclick={() => setter(getter() + 1)}>
        clique me [{getter()}]
      </button>
    </div>
  ));
}

export default A;
