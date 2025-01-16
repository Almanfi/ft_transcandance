/*
[ ] add friend
  + sender:
    + update friend page
    + update relations
  + reciever:
    + add toast
    + update relations
    + update notification

[ ] accept friend
  + add toast
  + update user
  + update notification

[ ] unfriend


[ ] block
[ ] unblock


[ ] chat message
[ ] chat.message.retrieve
[ ] game_invite

*/

import Ura from "ura";
import api from "./api.jsx";
import Toast from "../components/Toast.jsx";

const Allowed = [
  "friendship",
  "friendship_received",
  "friendship_accepted",
  // "chat",
  "chat.message.retrieve",
  "chat.message",
]

const handlers = {

}

function check(name) {
  if (Allowed.includes(name)) return
  throw `Error: Unknown event ${name} add it to allowed events`;
}

function add(name, handler) {
  console.warn("add event", name);
  check(name)
  if (handlers[name]) throw `Error: ${name} already exists`
  handlers[name] = {
    handler: handler,
    children: {}
  }
}

function emit(name, ...args) {
  check(name)
  handlers[name].handler(args);
  Object.keys(handlers[name].children).forEach(key => {
    console.log("emit child", key, "func:", handlers[name].children[key], "with arg", args);

    const isAsyncFunction = (fn) => fn.constructor.name === "AsyncFunction";
    if (isAsyncFunction(handlers[name].children[key]))
      (async () => await handlers[name].children[key](args))();
    else handlers[name].children[key](args)
  });
}

function emitChildren(name, ...args) {
  check(name)
  Object.keys(handlers[name].children).forEach(key => {
    console.log("emit child", key, "func:", handlers[name].children[key], "with arg", args);

    const isAsyncFunction = (fn) => fn.constructor.name === "AsyncFunction";
    if (isAsyncFunction(handlers[name].children[key]))
      (async () => await handlers[name].children[key](args))();
    else handlers[name].children[key](args)
  });
}

function addChild(name, childname, child) {
  check(name)
  console.log(handlers[name]);
  handlers[name].children[childname] = child;

  // if (Object.keys(handlers[name].children).includes(childname))
  // throw `${name} alread has ${childname} child`
}

function remove(name) {
  check(name)
  handlers[name] = undefined;
}

const events = {
  add,
  addChild,
  emit,
  emitChildren,
  remove,
}

events.add("friendship", () => { console.log("friendship event") })

events.add("friendship_received", async (data) => {
  // console.log("has:", data);
  if (data.length) {
    const res = await api.getUsersById([data[0].user_id]);
    Ura.create(<Toast message={`new invitation from ${res[0].display_name}`} color="green" />);
    // events.emitChildren("friendship");
  }
  Ura.refresh();
})

events.add("friendship_accepted", async (data) => {
  // console.log("has:", data);
  if (data.length) {
    const res = await api.getUsersById([data[0].user_id]);
    Ura.create(<Toast message={`${res[0].display_name} did accept invitation`} color="green" />);
    // events.emitChildren("friendship");
  }
  Ura.refresh();
})



export default events