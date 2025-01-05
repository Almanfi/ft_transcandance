import Ura from 'ura';
import {
  deleteUser, getRelations, getPicture, getUser,
  InviteFriend, Login, signup, updateUser, acceptInvitation,
  refuseInvitation, cancelInvitation,
  removeFriend,
  blockUser,
  unblockUser,
  searchUser
} from "../../services/api.js";
import users from '../../services/users.js';

function createForm(data) {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]);
  });
  return formData
}
function Test(props = {}) {
  const [render, State] = Ura.init();

  const [getAllUsers, setAllUsers] = State(null);
  const [getImageSrc, setImageSrc] = State("");


  const handleSignAllUsers = async () => {
    const all = await Promise.all(users.map(async user => signup(createForm(user))));
    setAllUsers(all);
    console.log("All users signed up:", all);
  };

  const handleLogAllUsers = async () => {
    const all = await Promise.all(users.map(user => Login(createForm(user))));
    setAllUsers(all);
    console.log("All users logged in:", all);
  };

  const handleDeleteAllUsers = async () => {
    for (const user of users) {
      await Login(createForm(user)); // TODO: must return something
      await deleteUser(); // TODO: must return something
    }
  };

  const handleSignup = async () => await signup(createForm(users[0]))
  const handleLogin = async () => await Login(createForm(users[0]))
  const handleSearch = async (char) => {
    const res = await searchUser(char)
    return res;
  }

  return render(() => (
    <div className="test">
      <button onclick={handleSignup}>Sign Up</button>
      <button onclick={handleLogin}>Login</button>
      <button onclick={getUser}>Get User</button>
      <button onclick={() => handleSearch("m")}>Search User</button>

      <button onclick={async () => setImageSrc(await getPicture())}>Get Image</button>
      <if cond={getImageSrc()}>
        <img src={getImageSrc()} alt="Dynamic" />
      </if>

      <button onclick={() => updateUser({ display_name: "abcde" })}>Update User</button>
      <button onclick={deleteUser}>Delete User</button>
      <button onclick={handleDeleteAllUsers} style={{ backgroundColor: "red" }} >Delete All Users</button>
      <button onclick={handleSignAllUsers}>Sign All Users</button>
      <button onclick={handleLogAllUsers}>Log All Users</button>

      <button onclick={async () => {
        await Login(createForm(createForm(users[0])));
        const res = await InviteFriend(getAllUsers()[1].id);
        console.log("Adding friend:", res);
      }}>Invite Friends</button>

      <button onclick={async () => {
        await Login(createForm(users[0]));
        const res = await getRelations();
        console.log("Getting friends:", res);
      }}>Get Friends</button>

      <button onclick={async () => {
        await Login(createForm(users[1]));
        const res = await getRelations();
        console.log("Getting relations:", res);
        await Promise.all(res.invited.map(e => acceptInvitation(e.id)));
      }}>Accept Friend</button>

      <button onclick={async () => {
        await Login(createForm(users[0]));
        const res = await getRelations();
        console.log("Getting relations:", res);
        await Promise.all(res.invites.map(e => cancelInvitation(e.id)));
      }}>Cancel Invitation</button>

      <button onclick={async () => {
        await Login(createForm(users[1]));
        const res = await getRelations();
        console.log("Getting relations:", res);
        await Promise.all(res.invited.map(e => refuseInvitation(e.id)));
      }}>Refuse Invitation</button>

      <button onclick={async () => {
        await Login(createForm(users[0]));
        const res = await getRelations();
        console.log("Getting relations:", res);
        await Promise.all(res.friends.map(e => removeFriend(e.id)));
      }}>Remove Friend</button>

      <button onclick={async () => {
        await Login(createForm(users[0]));
        await blockUser(getAllUsers()[1].id);
      }}>Block User</button>

      <button onclick={async () => {
        await Login(createForm(users[0]));
        const res = await getRelations();
        console.log("Getting relations:", res);
        await Promise.all(res.blocks.map(e => unblockUser(e.id)));
      }}>Unblock User</button>

      <a href="/api/oauth/42/">Go to 42 OAuth</a>
    </div>
  ));
}

export default Test;
