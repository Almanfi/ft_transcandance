import Ura from 'ura';
import Navbar from '../utils/Navbar/Navbar.js';
import { conversationGroups } from './convs.js';
import New from './new/new.js';

function Chat(props = {}) {
  const [render, State] = Ura.init();

  const [getIndex, setIndex] = State(-1);
  const [getGroup, setGroup] = State(conversationGroups)
  const [getConv, setConv] = State(getGroup()[5].conversation);

  const handle = (e, i)=>{
    setConv(e.conversation);
    setIndex(i);
  }
  
  return render(() => (
    <div className="chat">
      <Navbar />
      {/* <New/> */}
      <div className="left">
        <div className="up">
          <div className="create-group">
            {/* create group */}
            <h4>Create Group</h4>
          </div>
        </div>
        <div className="down">
          {/* friends to start chat with */}
          <loop on={getGroup()}>
            {(e, i) => (
              <div onclick={() => handle(e, i)}
                className={`${getIndex() === i ? "selected" : ""}`}>
                <h3>
                  Group {e.id}
                </h3>
              </div>
            )}
          </loop>
        </div>
      </div>

      <div className="right">
        {/* conversation */}
        <loop on={getConv()} className="up">
          {(e) => (
            <div className={e.user === "me" ? "mine" : "other"}>
              <p ><l>{e.user}</l>: {e.text}</p>
            </div>)}
        </loop>
        {/* send message */}
        <if cond={getConv().length}>
          <div className="down">
            <textarea name="" id=""></textarea>
            <button>{">"}</button>
          </div>
        </if>
        {/* <else>
          <div></div>
        </else> */}
      </div>
    </div>
  ));
}

export default Chat;

