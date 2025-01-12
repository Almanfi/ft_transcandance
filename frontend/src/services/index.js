// Array of items
import api from "./api.js";
import users from "./users.js";
const Selected = new Set();

const getLast = () => [...Selected].at(-1);

const root = document.getElementById('users');
const ids = {};

users.forEach((item, index) => {
  const div = document.createElement('div');
  div.textContent = item.username;
  div.style.cursor = 'pointer';
  div.addEventListener('click', () => {
    if (Selected.has(index)) {
      Selected.delete(index);
      div.className = '';
    } else {
      Selected.add(index);
      div.className = 'selected';
    }
    console.log('Selected input_value:', item);
  });
  root.appendChild(div);
});

const parent = document.getElementById("root")

function create(input_value, tag = "button") {
  const elem = document.createElement(tag);
  elem.id = input_value;
  elem.innerHTML = input_value
  parent.appendChild(elem);
  return elem;
}

function Form(data) {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]);
  });
  return formData
}

let input_value = null
create("", "input").oninput = (e) => {
  input_value = e.target.value
  console.log("input_value:", input_value);
}


create("login").onclick = async () => {
  for (const i of Selected) {
    console.log("log in as", users[i].username);
    await api.login(users[i]);
  }
  if (Selected.size == 0) console.error("Select at least one user");
}

/*
mhrima: "3922dafa-97b1-4af3-96a4-524bbf56102e"
ssmith: "bf16cfaa-1baf-4707-8f9b-62df094004aa"
jdoe:   "5c97be95-dc9a-4815-80f7-85e8d6cc4dcd"
ebrown: "2cfc9a0b-ce9a-445e-a983-cf010e1c76f5"
agreen: "a005400f-17a7-4f8d-bfef-50974105a3ee"
*/

create("signup").onclick = async () => {
  for (const i of Selected) {
    console.log("sign up as", users[i].username);
    await api.signup(Form(users[i]));
  }
  if (Selected.size == 0) console.error("Select at least one user");
}

create("delete user").onclick = async () => {
  for (const i of Selected) {
    console.log("log in as", users[i].username);
    await api.login(users[i]);
    await api.deleteUser();
  }
  if (Selected.size == 0) console.error("Select at least one user");
}

let user = null;
create("get user").onclick = async () => {
  user = await api.getUser();
  console.log(user);
}


create("log ids").onclick = () => {
  console.log(ids);
}

create("get friends").onclick = async () => {
  const res = await api.getRelations();
  console.log("getting friends", res);
}

/*
invites: sent invitations
invited: received invitations
friends: friends
blocks: blocked
*/

create("invite friend").onclick = async () => {
  console.log("invite friend:", input_value);
  const res = await api.inviteFriend(input_value)
  console.log("res:", res);
}

create("accept invitation").onclick = async () => {
  console.log("accept invitation", input_value);
  const res = await api.acceptInvitation(input_value);
  console.log("res:", res);
}

create("refuse invitation").onclick = async () => {
  console.log("refuse invitation", input_value);
  const res = await api.refuseInvitation(input_value);
  console.log("res:", res);
}

create("cancel invitation").onclick = async () => {
  console.log("cancel invitation", input_value);
  const res = await api.cancelInvitation(input_value);
  console.log("res:", res);
}

create("get user by id").onclick = async () => {
  if (!input_value || !input_value.length) console.error("check input");
  else {
    const res = await api.getUsersById([input_value])
    console.log(res);
  }
}
