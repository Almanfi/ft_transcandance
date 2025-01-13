import api from "./api.js";

const Store = {};
let index = 0;

function initStore(handler) {
  console.warn("call init store");

  const currentIndex = index;
  index++;

  const getter = async () => {
    if (Store[currentIndex] === undefined && handler) Store[currentIndex] = await handler();
    return Store[currentIndex];
  };

  const setter = (value) => {
    Store[currentIndex] = value;
  };

  return [getter, setter];
}

async function getUserData(){
  return await api.getUser()
}

export const GlobalUser = initStore(getUserData);
