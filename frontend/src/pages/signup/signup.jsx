import Ura from "ura";
import Navbar from "../../components/Navbar.jsx";
import Arrow from "../../components/icons/Arrow.jsx";
// import Toast from "../../components/Toast.js";
import Input from "../../components/Input.jsx";
import api from "../../services/api.js";
// import Home from "../home/home.js";

function truncateString(str) {
  if (str.length > 17) return str.substring(0, 14) + '...';
  return str;
}

function Signup() {
  const [render, State] = Ura.init();
  const [getPath, setPath] = State("");
  const [getImage, setImage] = State(null);

  const uploadImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPath(file.name)
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    const section = document.querySelector(".signup #center #input-section");
    const inputs = section.querySelectorAll("input");
    const data = {};
    inputs.forEach((input) => {
      if (input.value.length) data[input.name] = input.value
      else throw ({ message: `empty ${input.name} field` });
    });

    try {
      if (data.password !== data.confirm_password)
        throw ({ message: "password and confirm password are incompatibe" })
      else {
        delete data["confirmpassword"];
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          formData.append(key, data[key]);
        });
        const image = getImage();
        if (image && image instanceof File) {
          formData.append("profile_picture", image, "random.png");
        }
        await api.signup(formData);
        Ura.navigate("/login");
      }
    } catch (err) {
      api.handleError(err)
    }

  }

  return render(() => (
    <root>
      <Navbar />
      <form className="signup" onsubmit={createUser}>
        <div id="center">
          <div id="card">
            <h3 id="title">Sign up</h3>
            <label htmlFor="fileInput" className="file-input-label">Load Image {truncateString(getPath())}</label>
            <input type="file" id="fileInput" accept="image/*" onchange={uploadImage} hidden />
            <div id="input-section">
              <Input value="firstname" />
              <Input value="lastname" />
              <br />
              <Input value="username" />
              <Input value="display name" />
              <Input value="password" />
              <Input value="confirm password" />
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
    </root>
  ));
}

export default Signup;
