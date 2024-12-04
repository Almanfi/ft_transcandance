import Ura from "ura";
import Navbar from "../utils/Navbar/Navbar.jsx";
import Arrow from "../utils/Arrow/Arrow.jsx";


async function logUser(data) {
  try {
    const response = await fetch("http://localhost:8000/users/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include"
    });
    const cookieHeader = document.cookie.split("; ");
    console.log("Cookies from response headers:", cookieHeader);
  } catch (error) {
    console.error(error.message)
  }
}

function Login() {
  const [render, State] = Ura.init();

  const setUser = () => {
    Ura.store.set("user", { name: "mohammed" })
    Ura.navigate("/user")
  }
    return render(() => (
      <div className="login">
        <Navbar />
        <div id="center">
          <div id="card">
            <h3 id="title">Login</h3>
            <div id="input-section">
              <input type="text" placeholder={"Username"} />
              <input type="password" placeholder={"Password"} />

            </div>
            <div id={"button-section"}>
              <button id={"btn"}>
                <Arrow />
              </button>
            </div>
            <h4
              id="signin"
              onclick={() => {
                Ura.navigate("/signup");
              }}
            >
              Don't have an account ?
            </h4>
          </div>
          <button onclick={setUser}>
            set user
          </button>
        </div>
      </div>
    ));
}

export default Login;
