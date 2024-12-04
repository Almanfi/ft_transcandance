import Ura from "ura";
import Navbar from "../utils/Navbar/Navbar.jsx";
import Arrow from "../utils/Arrow/Arrow.jsx";

async function CreateUser(data) {
  try {
    const response = await Ura.send("POST", "http://localhost:8000/users/", {}, data)
    if (response.status != 201) console.error("Error creating user");
    else console.log("response", response);
  } catch (error) { console.error("Error:", error.message) }
}

async function LogUser(data)
{
  try {
    const response = await Ura.send("POST", "http://localhost:8000/users/login/", {}, data);
    if (response.status != 200) console.error("Error login user");
    else console.log("Login successful:", response);
  } catch (error) { console.error("Error:", error.message) }
}

function Signup() {
  const [render, State] = Ura.init();
  const [getCheck, setCheck] = State(true);

  const checkbox = (e) => {
    e.preventDefault();
    setCheck(e.target.checked);
  };
  const create = async () => {
    CreateUser({
      firstname: "user2", lastname: "user2",
      username: "user2_", password: "User123@@", display_name: "_user22"
    })
  }
  const login = async()=>{
    LogUser({ username: "user2_", password: "User123@@" })
  }

  return render(() => (
    <div className="signup">
      <Navbar />
      <div id="center">
        <div id="card">
          <h3 id="title">Sign up</h3>
          <div id="input-section">
            <input type="text" placeholder={"Firstname"} />
            <input type="text" placeholder={"Lastname"} />
            <br />
            <input type="text" placeholder={"Username"} />
            <input type="password" placeholder={"Password"} />
            <input type="password" placeholder={"Confirm Password"} />
          </div>
          <div id={"button-section"}>
            <button id={"btn"} onclick={login} ><Arrow /></button>
          </div>
          <h4
            id="signin"
            onclick={() => {
              Ura.navigate("/login");
            }}
          >
            Already have an account ?
          </h4>
        </div>
      </div>
    </div>
  ));
}

export default Signup;
