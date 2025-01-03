import Ura from 'ura';
import Input from '../../../components/input/Input.js';
import api from '../../../services/api.js';

function Settings(props = {}) {
  const { getShow, setShow, userData } = props;
  const [render, State] = Ura.init();
  // let user = JSON.parse(Ura.store.get("user") || "{}");
  // const [getError, setError] = State([]);
  const [getUserData, setUserData] = userData;

  const update = async (e) => {
    e.preventDefault();
    console.log(e.target);
    const section = document.querySelector(".settings .content .card .infos");
    const inputs = section.querySelectorAll("input");
    const data = {};
    const Errors = [];

    inputs.forEach((input) => {
      // if (!input.value.length) Errors.push(input.name);
      if (input.value.length) data[input.name] = input.value
    });
    console.log(data);
    if (!Errors.length) {
      if (data.password !== data.confirm_password) Errors.push(...["password", "confirmpassword"]);
      else {
        try {
          delete data["confirmpassword"];
          let res = await api.updateUser(data);
          res = await api.getUser();
          console.log("settings response");
          console.table(res);
          setUserData(res);
          /*
          display_name
          firstname
          id
          lastname
          profile_picture
          username
          */
          //  Ura.store.set("user", JSON.stringify(res));
          setShow(false);
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
  const handleDelete = async (e) => {
    const Errors = [];
    try {
      e.preventDefault();
      await api.deleteUser();
      Ura.rmCookie("id_key");
    } catch (error) {
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
    Errors.forEach((e, i) => Ura.create(<Toast message={e} delay={i} />))
  }
  return render(() => (
    <if cond={getShow()} className={`settings ${getShow() ? "" : "hidden"}`}>
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
    </if>
  ));
}


export default Settings;
