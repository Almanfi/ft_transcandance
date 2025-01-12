import Ura from "ura";
import Navbar from "../../components/Navbar/Navbar.js";
import Arrow from "../../components/Arrow/Arrow.js";
import Input from "../../components/Input/Input.js";
import Toast from "../../components/Toast/Toast.js";
import api from "../../services/api.js";
import Home from "../home/home.js";


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
        else throw `empty ${input.name} field`;
      });
      console.log("log with ", data);
      const res = await api.login(data);
      // const webSocket = api.getSocket();
      console.log("login response", res);
      // console.log("socket response", webSocket);

      const res0 = await api.getUser();
      Ura.store.set("id", res0.id);
      // console.table(res)
      // res = await api.getUser();
      /*
      display_name, firstname, id
      lastname, profile_picture, username
      */
      // Ura.store.set("user", JSON.stringify(res));
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
            <div id={"button-section"}>
              <button id="btn" type="submit">
                <Arrow />
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
