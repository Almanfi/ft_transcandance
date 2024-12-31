import Ura from "ura";
import Navbar from "../../components/Navbar/Navbar.jsx";
import Arrow from "../../components/Arrow/Arrow.jsx";
import Toast from "../../components/Toast/Toast.jsx";
import Input from "../../components/input/Input.jsx";
import api from "../../services/api.js";

function Signup() {
  const [render, State] = Ura.init();
  const [getError, setError] = State([]);
  const [getInvalid, setInvalid] = State([]);

  const createUser = async (e) => {
    e.preventDefault();
    setError([]);
    const section = document.querySelector(".signup #center #input-section");
    const inputs = section.querySelectorAll("input");
    const data = {};
    let Errors = [];
    inputs.forEach((input) => {
      // if (!input.value.length) Errors.push(input.name);
      data[input.name] = input.value
    });
    if (!Errors.length) {
      if (data.password !== data.confirm_password) setError(["password", "confirmpassword"]);
      else {
        try {
          delete data["confirmpassword"];
          const res = await api.Signup(data);
          console.log("signup response");
          console.table(res)
          /*
          display_name
          firstname
          id
          lastname
          profile_picture
          username
          */
         Ura.store.set("user", JSON.stringify(res));
        } catch (err) {
          console.log("err", err);
          if (err.message) setError([err.message]);
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
    }

    if (Errors.length) {
      setError(Errors);
      return;
    }
  }
  return render(() => (
    <>
      <Navbar />
      <form className="signup" onsubmit={createUser}>
        <div id="center">
          <h1>
            add upload image
          </h1>
          <div style={{ position: "absolute", top: "20px" }}>
            <loop on={getError()}>
              {(e, index) => (
                <Toast message={`${e}`} delay={index * 1} />
              )}
            </loop>
          </div>

          <div id="card">
            <h3 id="title">Sign up</h3>
            <div id="input-section">
              <Input
                value="firstname"
                isError={getError().includes("firstname")}
              />
              <Input
                value="lastname"
                isError={getError().includes("lastname")}
              />
              <br />
              <Input
                value="username"
                isError={getError().includes("username")}
              />
              <Input
                value="display name"
                isError={getError().includes("display_name")}
              />
              <Input
                value="password"
                isError={
                  getError().includes("password") ||
                  getError().includes("confirmpassword")
                }
              />
              <Input
                value="confirm password"
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
            <h4 id="signin" onclick={() => Ura.navigate("/login")}>
              Already have an account ?
            </h4>
          </div>
        </div>
      </form>
    </>
  ));
}

export default Signup;
