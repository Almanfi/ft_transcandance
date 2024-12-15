import Ura from 'ura';

function New(props = {}) {
  const [render, State] = Ura.init();

  return render(() => (
    <div className="new">
     <input type="text" placeholder="groups name" />
     <div className="members"></div>
     <input type="text" placeholder="members" />
     <button>create conversation</button>
    </div>
  ));
}

export default New;
