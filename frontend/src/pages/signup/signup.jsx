import Ura from "ura";
import Navbar from "../utils/Navbar/Navbar.js";
import Arrow from "../utils/Arrow/Arrow.js";
import Toast from "../utils/Toast/Toast.js";
import Input from "../utils/Input/Input.js";

function Signup() {
  // if (Ura.store.get("user")) {
  //   Ura.navigate("/home")
  //   window.location.reload();
  // }
  //else
  // {

  // }
  const [render, State] = Ura.init();
  const [getError, setError] = State([]);

  const createUser = async (e) => {
    e.preventDefault();
    const inputSection = document.querySelector(
      ".signup #center #input-section"
    );
    const inputs = inputSection.querySelectorAll("input");
    const data = {};

    inputs.forEach((input) => {
      // console.log(`Name: ${input.name}, Value: ${input.value}`);
      data[input.name] = input.value;
    });

    console.log(data);
    if (data.password !== data.confirmpassword) {
      console.error("incompatible password");
      setError([...getError(), "password", "confirmpassword"]);
    } else {
      delete data["confirmpassword"];
      try {
        const response = await fetch("http://localhost:8000/users/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        if (response.ok) {
          console.log("user created succefully", response);
          setError([]);
        } else {
          const res = await response.json();
          if (res.message) {
            setError([]);
            setError([res.message]);
          } else if (typeof res == "object") {
            let arr = [];
            Object.keys(res).forEach((key) => {
              if (typeof res[key] === "string") arr.push(res[key]);
              else arr.push(key);
            });
            setError([]);
            setError(arr);
          } else {
          }
          console.log(res);
        }
      } catch (error) {
        setError([]);
        setError([error.message]);
      }
    }
    // Ura.navigate("home");
    return;
  };
  return render(() => (
    <>
      <Navbar />
      <form className="signup" onsubmit={createUser}>
        <div id="center">
          <div style={{ position: "absolute", top: "20px" }}>
            <loop on={getError()}>
              {(e, index) => (
                <Toast message={`Invalid ${e}`} delay={index * 1} />
              )}
            </loop>
          </div>

          <div id="card">
            <h3 id="title">Sign up</h3>
            <div id="input-section">
              <Input
                name="firstname"
                value="Firstname"
                isError={getError().includes("firstname")}
              />
              <Input
                name="lastname"
                value="Lastname"
                isError={getError().includes("lastname")}
              />
              <br />
              <Input
                name="username"
                value="User name"
                isError={getError().includes("username")}
              />
              <Input
                name="display_name"
                value="Display name"
                isError={getError().includes("display_name")}
              />
              <Input
                name="password"
                value="Password"
                isError={
                  getError().includes("password") ||
                  getError().includes("confirmpassword")
                }
              />
              <Input
                name="confirm password"
                value="Confirm Password"
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
