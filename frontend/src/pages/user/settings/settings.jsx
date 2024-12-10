import Ura from 'ura';

function Settings(props = {}) {
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);

  return render(() => (
    <div className="settings">
      <div className="content">
        <div className="img">ffff</div>
        <div className="card">
          <div className="infos">
            <input type="text" placeholder="First name" />
            <input type="text" placeholder="Last name" />
            <input type="email" placeholder="Email" />
            <input type="email" placeholder="Confirm Email" />
            <input type="password" placeholder="Password" />
            <input type="password" placeholder="Confirm Password" />
          </div>
        </div>
        <button><b>Save</b></button>
      </div>
    </div>
  ));
}

export default Settings;
