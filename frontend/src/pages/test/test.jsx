import Ura from 'ura';
import {
  deleteUser, getRelations, getPicture, getUser,
  InviteFriend, Login, Signup, updateUser, acceptInvitation,
  refuseInvitation, cancelInvitation,
  removeFriend,
  blockUser,
  unblockUser,
  searchUser
} from "../../services/api.js";

const users = [
  {
    firstname: "mohammed",
    lastname: "hrima",
    username: "mhrima",
    password: "Mhrima123@@",
    display_name: "yuliy"
  },
  {
    firstname: "sara",
    lastname: "smith",
    username: "ssmith",
    password: "SaraSmith456##",
    display_name: "sara_s"
  },
  {
    firstname: "john",
    lastname: "doe",
    username: "jdoe",
    password: "JohnDoe789**",
    display_name: "johnny"
  },
  {
    firstname: "emily",
    lastname: "brown",
    username: "ebrown",
    password: "EmilyBrown101!!",
    display_name: "em_brown"
  }
];

function Test(props = {}) {
  const [render, State] = Ura.init();

  const [getAllUsers, setAllUsers] = State(null);
  const [getImageSrc, setImageSrc] = State("");

  const handleDeleteAllUsers = async () => {
    for (const user of users) {
      await Login(user); // TODO: must return something
      await deleteUser(); // TODO: must return something
    }
  };

  const handleSignAllUsers = async () => {
    const all = await Promise.all(users.map(user => Signup(user)));
    setAllUsers(all);
    console.log("All users signed up:", all);
  };

  const handleLogAllUsers = async () => {
    const all = await Promise.all(users.map(user => Login(user)));
    setAllUsers(all);
    console.log("All users logged in:", all);
  };

  return render(() => (
    <div className="test">
      <button onclick={() => Signup(users[0])}>Sign Up</button>
      <button onclick={() => Login(users[0])}>Login</button>
      <button onclick={getUser}>Get User</button>
      <button onclick={() => searchUser("m")}>Search User</button>

      <button onclick={async () => setImageSrc(await getPicture())}>Get Image</button>
      <if cond={getImageSrc()}>
        <img src={getImageSrc()} alt="Dynamic" />
      </if>

      <button onclick={() => updateUser({ display_name: "abcde" })}>Update User</button>
      <button onclick={deleteUser}>Delete User</button>
      <button onclick={handleDeleteAllUsers}>Delete All Users</button>
      <button onclick={handleSignAllUsers}>Sign All Users</button>
      <button onclick={handleLogAllUsers}>Log All Users</button>

      <button onclick={async () => {
        await Login(users[0]);
        const res = await InviteFriend(getAllUsers()[1].id);
        console.log("Adding friend:", res);
      }}>Invite Friends</button>

      <button onclick={async () => {
        await Login(users[0]);
        const res = await getRelations();
        console.log("Getting friends:", res);
      }}>Get Friends</button>

      <button onclick={async () => {
        await Login(users[1]);
        const res = await getRelations();
        console.log("Getting relations:", res);
        await Promise.all(res.invited.map(e => acceptInvitation(e.id)));
      }}>Accept Friend</button>

      <button onclick={async () => {
        await Login(users[0]);
        const res = await getRelations();
        console.log("Getting relations:", res);
        await Promise.all(res.invites.map(e => cancelInvitation(e.id)));
      }}>Cancel Invitation</button>

      <button onclick={async () => {
        await Login(users[1]);
        const res = await getRelations();
        console.log("Getting relations:", res);
        await Promise.all(res.invited.map(e => refuseInvitation(e.id)));
      }}>Refuse Invitation</button>

      <button onclick={async () => {
        await Login(users[0]);
        const res = await getRelations();
        console.log("Getting relations:", res);
        await Promise.all(res.friends.map(e => removeFriend(e.id)));
      }}>Remove Friend</button>

      <button onclick={async () => {
        await Login(users[0]);
        await blockUser(getAllUsers()[1].id);
      }}>Block User</button>

      <button onclick={async () => {
        await Login(users[0]);
        const res = await getRelations();
        console.log("Getting relations:", res);
        await Promise.all(res.blocks.map(e => unblockUser(e.id)));
      }}>Unblock User</button>

      <a href="/api/oauth/42/">Go to 42 OAuth</a>
    </div>
  ));
}

export default Test;
