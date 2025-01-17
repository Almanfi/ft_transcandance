import Ura from 'ura';
import Navbar from '../../components/Navbar.js';
import list from './games.js';



function History(props = {}) {
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);

  return render(() => (
    <root>
      <Navbar />
      <div className="history" loop={list}>
        {(e) => (
          <div className={`data ${e.win ? "win" : "lost"}`}>
            <p >{e.left}{" vs "}{e.right} </p>
          </div>
        )
        }
      </div>
    </root>
  ));
}

export default History;
