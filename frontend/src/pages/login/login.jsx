import Ura from "ura";
import Navbar from "../../components/Navbar.js";
import Arrow from "../../components/icons/Arrow.js";
import Input from "../../components/Input.js";
// import Toast from "../../components/Toast.js";
import api from "../../services/api.js";
import Ft from "../../components/icons/ft.js";
// import Home from "../home/home.js";


function Login() {
  const [render] = Ura.init();

  const logUser = async (e) => {
    e.preventDefault();
    try {

      const inputSection = document.querySelector(".login #center #input-section");
      const inputs = inputSection.querySelectorAll("input");

      const data = {};
      inputs.forEach((input) => {
        if (input.value.length) data[input.name] = input.value
        else throw ({message:`empty ${input.name} field`})
      });
      await api.login(data);
      Ura.navigate("/home");
    } catch (err) {
      api.handleError(err);
    }
  };

  return render(() => (
    <root>
      <Navbar />
      <form className="login" onsubmit={logUser}>
        <div id="center">
          <div id="card">
            <h3 id="title">Login</h3>
            <div id="input-section">
              <Input value="username" />
              <Input value="password" />
            </div>
            <div id="button-section">
              <button type="submit">
                <Arrow />
              </button>
              <button onclick={() => window.location.href = "https://localhost:8000/oauth/42/"} type="button">
                <Ft />
              </button>
            </div>
            <h4 id="signin" onclick={() => Ura.navigate("/signup")}>Don't have an account?</h4>
          </div>
        </div>
      </form>
    </root>
  ));
}

export default Login;
