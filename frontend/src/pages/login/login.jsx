import Ura from "ura";
import Navbar from "../../components/Navbar/Navbar.jsx";
import Arrow from "../../components/Arrow/Arrow.jsx";
import Input from "../../components/input/Input.jsx";
import Toast from "../../components/Toast/Toast.jsx";
import api from "../../services/api.js";
import Home from "../home/home.jsx";


function Login() {
  const [render] = Ura.init();

  const logUser = async (e) => {
    e.preventDefault();
    const Errors = [];

    const inputSection = document.querySelector(".login #center #input-section");
    const inputs = inputSection.querySelectorAll("input");
    const data = {};
    inputs.forEach((input) => {
      if (input.value.length) data[input.name] = input.value
      else Errors.push(`empty ${input.name} field`);
    });

    if (!Errors.length) {
      console.log("log with ", data);

      try {
        const res = await api.Login(data);
        console.log("login response");
        // console.table(res)
        // res = await api.getUser();
        /*
        display_name, firstname, id
        lastname, profile_picture, username
        */
        // Ura.store.set("user", JSON.stringify(res));
        Ura.navigate("/home");
      } catch (err) {
        console.log("err", err);
        if (err.message) Errors.push(err.message);
        else if (typeof err == "object") {
          Object.keys(err).forEach((key) => {
            if (typeof err[key] === "string") Errors.push(err[key]);
            else if (err[key].length && typeof err[key][0] === "string")
              err[key].forEach(elem => Errors.push(`${elem} (${key})`))
            else Errors.push(key);
          });
        }
      }
    }
    console.log("errors:", Errors);

    if (Errors.length) {
      Errors.forEach((e, i) => Ura.create(<Toast message={e} delay={i} />))
      return;
    }
  };


  return render(() => (
    <>
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
    </>
  ));
}

export default Login;
