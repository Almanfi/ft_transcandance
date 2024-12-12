import Ura from 'ura';
import Navbar from '../utils/Navbar/Navbar.js';

function Chat(props = {}) {
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);
  

  return render(() => (
    <div className="chat">
     <Navbar/>
     <div className="left">
      
     </div>
     <div className="right">

     </div>
    </div>
  ));
}

export default Chat;

