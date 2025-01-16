import Ura from 'ura';
import Navbar from '../../components/Navbar.js';

function Notifications(props = {}) {
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);

  return render(() => (
    <root>
      <Navbar/>
      <div className="notifications">
       
      </div>
    </root>
  ));
}

export default Notifications;
