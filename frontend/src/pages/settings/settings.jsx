import Ura from 'ura';

function Settings(props = {}) {
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);

  return render(() => (
    <div className="settings" style-src="./settings.css">
      <h1 className="">
        Hello from Settings component!
      </h1>
      <button className="" 
        onclick={() => setter(getter() + 1)}>
        Click me [{getter()}]
      </button>
    </div>
  ));
}

export default Settings;
