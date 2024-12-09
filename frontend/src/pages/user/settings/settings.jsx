import Ura from 'ura';

function Settings(props = {}) {
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);

  return render(() => (
    <div className="settings">
      <h1 className="">hhff
        Hello from Settings component!
      </h1>
    </div>
  ));
}

export default Settings;
