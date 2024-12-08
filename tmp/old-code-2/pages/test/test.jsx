//@ts-ignore
import Ura from 'ura';

async function CreateUser(data) {
  try {
    const res = await Ura.send("POST", "http://localhost:8000/users/", {}, data)
    if (res.status != 201) console.error("Error creating user");
    else console.log("signup:", res);
  } catch (error) { console.error("Error:", error.message) }
}

async function LogUser(data) {
  try {
    const res = await Ura.send("POST", "http://localhost:8000/users/login/", {}, data);
    if (res.status != 200) console.error("Error login user");
    else console.log("login:", res);
  } catch (error) { console.error("Error:", error.message) }
}

function Test(props = {}) {
  const [render, State] = Ura.init();

  const login = async () => LogUser({ username: "test", password: "Test123@@" })

  const signup = async () => CreateUser({
    firstname: "test", lastname: "test", username: "test",
    password: "Test123@@", display_name: "test"
  })

  return render(() => (
    <div className="test">
      <h1 className="">
        Hello from Test component!
      </h1>
      <button className="" onclick={signup}>sign up</button>
      <button className="" onclick={login}>login</button>
    </div>
  ));
}

export default Test;
