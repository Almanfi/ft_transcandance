import Ura from "ura";
import Navbar from "../../components/Navbar/Navbar.jsx";
import Arrow from "../../components/Arrow/Arrow.jsx";
import Input from "../../components/input/Input.jsx";
import Toast from "../../components/Toast/Toast.jsx";

// console.log(document.cookie);

// logUser0();

function Login() {
  const [render, State] = Ura.init();
  const [getError, setError] = State([]);

  const logUser = async (e) => {
    e.preventDefault();
    const inputSection = document.querySelector(".login #center #input-section");
    const inputs = inputSection.querySelectorAll("input");
    const data = {};

    inputs.forEach((input) => {
      data[input.name] = input.value;
    });

    if (!data.username || !data.password) {
      setError(["username", "password"]);
      console.error("Username and password are required");
      return;
    }

    // try {
    //   const response = await send("users/login/", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(data),
    //     // credentials: "include",
    //   });

    //   if (response.ok) {
    //     console.log("Login successful", response);
    //     setError([]);
    //     Ura.navigate("/home");
    //   } else {
    //     const res = await response.json();
    //     if (res.message) {
    //       setError([res.message]);
    //     } else {
    //       let arr = [];
    //       Object.keys(res).forEach((key) => {
    //         if (typeof res[key] === "string") arr.push(res[key]);
    //         else arr.push(key);
    //       });
    //       setError([]);
    //       setError(arr);
    //     }
    //   }
    // } catch (error) {
    //   console.error("Error logging in:", error.message);
    //   setError([error.message]);
    // }
  };


  return render(() => (
    <>
      <Navbar />
      <form className="login" onsubmit={logUser}>
        <div id="center">
          <div style={{ position: "absolute", top: "20px" }}>
            <loop on={getError()}>
              {(e, index) => <Toast message={`Invalid ${e}`} delay={index * 1} />}
            </loop>
          </div>

          <div id="card">
            <h3 id="title">Login</h3>
            <div id="input-section">
              <Input
                name="username"
                value="Username"
                isError={getError().includes("username")}
              />
              <Input
                name="password"
                value="Password"
                isError={getError().includes("password")}
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
