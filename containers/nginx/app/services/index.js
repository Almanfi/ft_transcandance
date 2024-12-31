import { deleteUser, getRelations, getPicture, getUser, InviteFriend, Login, Signup, updateUser, acceptInvitation, refuseInvitation, cancelInvitation, removeFriend, blockUser, unblockUser, searchUser } from "./api.js";
const users = [
    {
        firstname: "mohammed",
        lastname: "hrima",
        username: "mhrima",
        display_name: "yuliy",
        password: "Mhrima123@@"
    },
    {
        firstname: "sara",
        lastname: "smith",
        username: "ssmith",
        display_name: "sara_s",
        password: "SaraSmith456##",
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
console.log("hello");
const parent = document.getElementById("root");
function create(value) {
    const elem = document.createElement("button");
    elem.id = value;
    elem.innerHTML = value;
    parent.appendChild(elem);
    return elem;
}
function createImg() {
    const elem = document.createElement("img");
    parent.appendChild(elem);
    return elem;
}
create("login").onclick = async () => {
    await Login(users[0]);
};
create("signup").onclick = async () => {
    await Signup(users[0]);
};
create("get user").onclick = async () => {
    await getUser();
};
create("search user").onclick = async () => {
    await searchUser("m");
};
const img = createImg();
create("get image").onclick = async () => {
    img.src = await getPicture();
};
create("update user").onclick = async () => {
    await updateUser({
        display_name: "abcde"
    });
};
create("delete user").onclick = async () => {
    await deleteUser();
};
create("delete all users").onclick = async () => {
    users.forEach(async (user) => {
        await Login(user); // TODO: must return something
        await deleteUser(); // TODO: must return something
    });
};
let all = null;
create("signs all users").onclick = async () => {
    all = await Promise.all(users.map(async (user) => await Signup(user)));
    console.log("all users:", all);
};
create("logs all users").onclick = async () => {
    all = await Promise.all(users.map(async (user) => await Login(user)));
    console.log("all users:", all);
};
create("invite friends").onclick = async () => {
    await Login(users[0]);
    const res = await InviteFriend(all[1].id);
    console.log("adding friend", res);
};
create("get friends").onclick = async () => {
    await Login(users[0]);
    const res = await getRelations();
    console.log("getting friends", res);
};
create("accept friend").onclick = async () => {
    await Login(users[1]);
    const res = await getRelations();
    console.log("fetting relations", res);
    await Promise.all(res.invited.map(async (e) => await acceptInvitation(e.id)));
};
create("cancel invitation").onclick = async () => {
    await Login(users[0]);
    const res = await getRelations();
    console.log("fetting relations", res);
    await Promise.all(res.invites.map(async (e) => await cancelInvitation(e.id)));
};
create("refuse invitation").onclick = async () => {
    await Login(users[1]);
    const res = await getRelations();
    console.log("fetting relations", res);
    await Promise.all(res.invited.map(async (e) => await refuseInvitation(e.id)));
};
create("remove friend").onclick = async () => {
    await Login(users[0]);
    const res = await getRelations();
    console.log("fetting relations", res);
    await Promise.all(res.friends.map(async (e) => await removeFriend(e.id)));
};
create("block user").onclick = async () => {
    await Login(users[0]);
    await blockUser(all[1].id);
};
create("unblock user").onclick = async () => {
    await Login(users[0]);
    const res = await getRelations();
    console.log("fetting relations", res);
    await Promise.all(res.blocks.map(async (e) => await unblockUser(e.id)));
};
const a = document.createElement("a");
a.href = "/api/oauth/42/";
a.innerHTML = "go to 42 oauth";
parent.appendChild(a);
