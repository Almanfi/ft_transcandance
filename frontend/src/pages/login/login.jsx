import Ura from "ura";
import Navbar from "../../components/Navbar/Navbar.jsx";
import Arrow from "../../components/Arrow/Arrow.jsx";
import Input from "../../components/input/Input.jsx";
import Toast from "../../components/Toast/Toast.jsx";
import api from "../../services/api.js";

// console.log(document.cookie);

// logUser0();
function Login() {
  const [render, State, ForcedState] = Ura.init();
  const [getError, setError] = ForcedState([]);

  const logUser = async (e) => {
    e.preventDefault();
    const inputSection = document.querySelector(".login #center #input-section");
    const inputs = inputSection.querySelectorAll("input");
    const data = {};
    let Errors = [];
    inputs.forEach((input) => {
      data[input.name] = input.value
    });
    if (!Errors.length) {
      console.log("log with ", data);

      try {
        let res = await api.Login(data);
        console.log("login response");
        res = await api.getUser();
        console.table(res)
        /*
        display_name, firstname, id
        lastname, profile_picture, username
        */
        Ura.store.set("user", JSON.stringify(res));
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
      setError(Errors);
      return;
    }
  };


  return render(() => (
    <>
      <Navbar />
      <form className="login" onsubmit={logUser}>
        <div id="center">
          <div style={{ position: "absolute", top: "20px" }}>
            <loop on={getError()}>
              {(e, index) => <Toast message={`${e}`} delay={index * 1} />}
            </loop>
          </div>

          <div id="card">
            <h3 id="title">Login</h3>
            <div id="input-section">
              <Input
                value="username"
                isError={getError().includes("username")}
              />
              <Input
                value="password"
                isError={
                  getError().includes("password") ||
                  getError().includes("confirmpassword")
                }
              />
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
