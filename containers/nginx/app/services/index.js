import { deleteUser, getRelations, getPicture, getUser, InviteFriend, Login, signup, updateUser, acceptInvitation, refuseInvitation, cancelInvitation, removeFriend, blockUser, unblockUser, searchUser } from "./api.js";
import users from "./users.js";
console.log("hello");
const parent = document.getElementById("root");
let user = {};
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
    await signup(users[0]);
};
create("get user").onclick = async () => {
    user = await getUser();
};
create("search user").onclick = async () => {
    await searchUser("m");
};
const img = createImg();
create("get image").onclick = async () => {
    try {
        user = await getUser();
        console.log(user);
        const path = "/static/rest/images/users_profiles/nl6HulGQnbWP.png";
        img.src = await getPicture(path);
    }
    catch (error) {
        console.error("found error", error);
    }
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
    all = await Promise.all(users.map(async (user) => await signup(user)));
    console.log("all users:", all);
};
create("logs all users").onclick = async () => {
    all = await Promise.all(users.map(async (user) => await Login(user)));
    console.log("all users:", all);
};
create("invite friends").onclick = async () => {
    await Login(users[0]);
    let i = 1;
    while (i < 5) {
        const res = await InviteFriend(users[i].id);
        console.log("adding friend", res);
        i++;
    }
};
create("accept friends").onclick = async () => {
    let i = 1;
    while (i < 5) {
        await Login(users[i]);
        const res = await getRelations();
        console.log("fetting relations", res);
        await Promise.all(res.invited.map(async (e) => await acceptInvitation(e.id)));
        i++;
    }
};
create("get friends").onclick = async () => {
    await Login(users[0]);
    const res = await getRelations();
    console.log("getting friends", res);
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
