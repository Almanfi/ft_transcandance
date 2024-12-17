import Ura from 'ura';

function Tmp({ user }) {
  console.log("tmp:", user);
  
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);

  return render(() => (
    <div className="live">
      <h1 className="">
        Hello from tmp component!
      </h1>
      <button className=""
        onclick={() => setter(getter() + 1)}>
        Click me [{getter()}]
      </button>
    </div>
  ));
}

function Live(props = {}) {
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);

  return render(() => (
    <div className="live">
      <h1 className="">
        Hello from Live component!
      </h1>
      <a href="/home">home</a>
      <button className=""
        onclick={() => Ura.navigate("/home", { user: "abc" })}>
        Click me [{getter()}]
      </button>
      <div>
        <Tmp user={"123"}/>
      </div>
    </div>
  ));
}

export default Live;
