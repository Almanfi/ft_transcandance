import Ura from "ura";
import Navbar from "../../components/Navbar/Navbar.js";
import Arrow from "../../components/Arrow/Arrow.js";
import Toast from "../../components/Toast/Toast.js";
import Input from "../../components/Input/Input.js";
import api from "../../services/api.js";
import Home from "../home/home.js";

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
    const Errors = [];

    const section = document.querySelector(".signup #center #input-section");
    const inputs = section.querySelectorAll("input");
    const data = {};
    inputs.forEach((input) => {
      if (input.value.length) data[input.name] = input.value
      else Errors.push(`empty ${input.name} field`);
    });

    if (!Errors.length) {
      if (data.password !== data.confirm_password) Errors.push("Password and Confirm Password do not match")
      else {
        try {
          delete data["confirmpassword"];

          const formData = new FormData();
          Object.keys(data).forEach((key) => {
            formData.append(key, data[key]);
          });

          const image = getImage();
          if (image && image instanceof File) {
            console.log("Appending the image:", image);
            formData.append("profile_picture", image, "random.png");
          } else {
            console.log("No image or invalid image:", image);
          }

          console.log("send", formData);


          const res = await api.signup(formData);
          console.log("signup response");
          console.table(res)
          /*
            display_name, firstname, id
            lastname, profile_picture, username
          */
          //  Ura.store.set("user", JSON.stringify(res));
          Ura.navigate("/login");
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
    }
    Errors.forEach((e, i) => Ura.create(<Toast message={e} delay={i} />))
  }
  return render(() => (
    <>
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
    </>
  ));
}

export default Signup;
