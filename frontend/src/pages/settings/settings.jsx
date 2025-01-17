import Ura from 'ura';
import Input from '../../components/Input.js';
import { truncateString } from '../../services/utils.js';
import api from '../../services/api.js';
import Navbar from '../../components/Navbar.js';

function Settings() {
  const [render, State] = Ura.init();
  const [getImage, setImage] = State(null);
  const [getPath, setPath] = State("");

  const uploadImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPath(file.name)
    }
  };

  const update = async (e) => {
    e.preventDefault();
    const section = document.querySelector(".settings .content .card .infos");
    const inputs = section.querySelectorAll("input");
    const data = {};
    inputs.forEach((input) => {
      if (input.value.length) data[input.name] = input.value
    });
    try {
      console.log(data);
      if (data.password !== data.confirm_password) {
        throw ({ message: "password and confirm password are incompatibe" })
      }
      else {
        delete data["confirmpassword"];
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          formData.append(key, data[key]);
        });
        const image = getImage();
        if (image && image instanceof File) {
          formData.append("profile_picture", image, getPath());
        }

        let res = await api.updateUser(formData);
        console.log("settings response", res);
        // res = await api.getUser();
        console.table(res);
        setShow(false);
      }
    } catch (err) {
      api.handleError(err)
    }
  }
  const handleDelete = async (e) => {
    try {
      e.preventDefault();
      await api.deleteUser();
    } catch (error) {
      api.handleError(error)
    }
  }


  return render(() => (
    <root>
      <Navbar/>
      <div className="settings">
        <form className="content" onsubmit={update}>
          <div className="img">
            <label htmlFor="fileInput" className="file-input-label">Load Image {truncateString(getPath())}</label>
            <input type="file" id="fileInput" accept="image/*" onchange={uploadImage} hidden />
          </div>
          <div className="card">
            <div className="infos">
              <Input value="firstname" />
              <Input value="lastname" />
              <br />
              <Input value="display name" />
              <Input value="password" />
              <Input value="confirm password" />
            </div>
          </div>
          <button onclick={handleDelete} type="button">Delete account</button>
          <button type="submit"><b>Save</b></button>
        </form>
      </div>
    </root>
  ));
}

export default Settings;
