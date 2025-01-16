import Ura from 'ura';
import Input from '../../../components/Input.jsx';
import api from '../../../services/api.jsx';

function Settings(props = {}) {
  const { Show, userData } = props;
  const [getShow, setShow] = Show;
  const [render, State] = Ura.init();
  const [getUserData, setUserData] = userData;

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
        let res = await api.updateUser(data);
        res = await api.getUser();
        console.log("settings response");
        console.table(res);
        setUserData(res);
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
      api.logout();
    } catch (error) {
      api.handleError(error)
    }
  }
  return render(() => (
    <div if={getShow()} className={`settings ${getShow() ? "" : "hidden"}`}>
      <span className="close" onclick={() => setShow(!getShow())}>X</span>
      <form className="content" onsubmit={update}>
        <div className="img">
          <img src={`/api/${getUserData().profile_picture}`} alt="" className="img" />
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
        <button onclick={handleDelete}>Delete account</button>
        <button type="submit"><b>Save</b></button>
      </form>
    </div>
  ));
}


export default Settings;
