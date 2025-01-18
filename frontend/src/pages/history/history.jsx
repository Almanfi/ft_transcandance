import Ura from 'ura';
import Navbar from '../../components/Navbar.js';
import list from './games.js';
import api from '../../services/api.jsx';



function History(props = {}) {
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);
  const [getHistory, setHistory] = State([])

  const fetchHistory = async () => {
    const history = await api.getHistory();
    console.log("The history is: ", history);
    setHistory(history.filter(e => e.team_a && e.team_b && e.team_a[0] && e.team_b[0] && e.game_ended));
  }

  fetchHistory()
  return render(() => (
    <root>
      <Navbar />
      <div className="history" loop={getHistory()}>
        {(e) => (
          <div className={`data ${e.win ? "win" : "lost"}`} >
            {/* <p >team_a: {e.team_a[0].display_name}{" vs "}team_b: {e.team_b[0].display_name} </p> */}
            <p >{e.team_a[0].display_name}{" vs "}{e.team_b[0].display_name}</p>
            {/* <p> */}
            {/* {e.team_b.length != 0 && e.team_a.length != 0 ? "":"false"} */}
            {/* </p> */}
          </div>
        )
        }
      </div>
    </root>
  ));
}

export default History;
