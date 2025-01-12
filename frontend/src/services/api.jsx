import Ura from 'ura';
import Toast from '../components/Toast/Toast.js';

const endpoint = "https://localhost:8000";

async function send(url, prams) {
  return fetch(`${endpoint}${url}`, {
    credentials: "include",
    ...prams
  })
}

export async function signup(user) {
  // try {
  const response = await fetch(`${endpoint}/users/`, {
    method: "POST",
    body: user,  // FormData passed here
  });

  if (response.ok) {
    console.log("User created successfully");
    const body = await response.json();
    return body;
  } else {
    const body = await response.json();
    console.log("Error creating user", body.message);
    throw body;
  }
  // } catch (error) {
  //   console.log("Error:", error);
  //   throw error;
  // }
}

export async function login(user) {
  // try {
  const response = await fetch(`${endpoint}/users/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(user),
  });
  if (response.ok) { console.log("user login succefully"); }
  else {
    const body = await response.json();
    console.log("Error login users", body.message);
    throw body;
  }
  // } catch (error) {
  //   console.log("error", error);
  // }
}

// let userData = localStorage.getItem("user");
// if (userData) userData = JSON.parse(userData);

export async function getUser() {
  // get user data
  // try {
  const response = await fetch(`${endpoint}/users/`, {
    credentials: "include",
  });
  // console.log("res", response);

  if (response.ok) {
    const body = await response.json();
    // console.log("get user succefully", body);
    // userData = body;
    // localStorage.setItem("user", JSON.stringify(userData))
    return body;
  }
  // else if (response.status === 403) {
  //   throw {
  //     status: 403,
  //     message: "",
  //   }
  // }
  else {
    const body = await response.json();
    // console.log("Error get user", body.message);
    throw body;
  }
  // } catch (error) {
  //   console.log("error", error);
  // }
  /*
created_at: "2024-12-30T14:05:15.080852Z"
display_name: "yuliy"
firstname: "mohammed"
id: "b1c67e5f-5ca7-4b43-98e8-d9cd25df3031"
lastname: "hrima"
oauth_user: false
oauth_username :  null
profile_picture: "/static/rest/images/users_profiles/profile.jpg"
status: "disconected"
username: "mhrima"
  */
}

export async function getUsersById(ids) {
  // get user data
  // try {
  // if(ids.length === 0)
  // {
  //   console.error("request empty");
  //   return []
  // }
  // else
  // {
  // console.warn("send getUsersById", ids);
  console.log(JSON.stringify(ids));
  const response = await fetch(`${endpoint}/users/fetch/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(ids)
  });
  // console.log("res", response);

  if (response.ok) {
    const body = await response.json();
    // console.log("get user succefully", body);
    // userData = body;
    // localStorage.setItem("user", JSON.stringify(userData))
    return body;
  }
  // else if (response.status === 403) {
  //   throw {
  //     status: 403,
  //     message: "",
  //   }
  // }
  else {
    const body = await response.json();
    // console.log("Error get user", body.message);
    throw body;
  }
  // }
  // } catch (error) {
  //   console.log("error", error);
  // }
}


export async function searchUser(searchTerm) {
  // try {
  const response = await fetch(`${endpoint}/users/search/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ "search_term": searchTerm })
  })
  if (response.ok) {
    const body = await response.json();
    console.log("response search", body);
    return body;
  }
  else {
    const body = await response.json();
    console.log("Error search", body.message);
    throw body;
  }
  // }
  // catch (error) {
  //   console.log("error", error);
  // }
}

export async function getPicture(pathname) {

  // if (!userData) throw "user data is null"
  // console.log("fetch", userData.profile_picture);

  const response = await fetch(`${endpoint}${pathname}`, {
    method: "GET",
    credentials: "include",
    mode: "no-cors",
  })
  if (response.ok) {
    const body = await response.blob();
    console.log("hello", body);
    const imageUrl = URL.createObjectURL(body);
    return imageUrl
  }
  else {
    const body = await response.text();
    console.log("Error get picture", body);
    throw body;
  }

}

export async function updateUser(data) {
  // try {
  /* 
  data than can be changed:
  display_name, firstname, lastname, profile_picture, username
  */
  const response = await fetch(`${endpoint}/users/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", },
    credentials: "include",
    body: JSON.stringify(data)
  })
  if (response.ok) {
    console.log("user updated succefully");
  }
  else {
    const body = await response.json();
    console.log("Error update user", body.message);
    throw body;
  }
  // } catch (error) {
  //   console.log("error", error);
  // }
}

export async function deleteUser() {
  try {
    // if (!userData) throw "user data is null"
    /* 
    data than can be changed:
    display_name, firstname, lastname, profile_picture, username
    */
    const response = await fetch(`${endpoint}/users/`, {
      method: "DELETE",
      credentials: "include",
    })
    if (response.ok) {
      console.log("user deleted succefully");
    }
    else {
      const body = await response.json();
      console.log("Error deleting user", body.message);
    }
  } catch (error) {
    console.log("error", error);
  }
}

export async function getRelations() {
  /*
  return
  {
    blocks: [], // blocked users
    friends:[], // existing friends
    invited:[], // recieved invitations
    invites: [], //sent invitations
  }
  */
  // try {
  const response = await fetch(`${endpoint}/relationships/`,
    {
      credentials: "include",
    }
  );
  if (response.ok) {
    // console.log("fetting relations succefully");
    const body = await response.json();
    return body;
  }
  else {
    const body = await response.json();
    throw body;

    // console.log("Error getting relations", body.message);
  }
  // } catch (error) {
  //   // console.log("error", error);
  // }
}

export async function inviteFriend(friendId) {
  // try {
  console.log("ask", { "friend_id": friendId });

  const response = await fetch(`${endpoint}/relationships/invite/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", },
    credentials: "include",
    body: JSON.stringify({ "friend_id": friendId })
  })
  if (response.ok) {
    console.log("invited friend succefully");
    const body = await response.json();
    return body;
  }
  else {
    const body = await response.json();
    // console.log("Error inviting friend", body.message);
    throw body;
  }
  // } catch (error) {
  //   console.log("error", error);
  // }
}

export async function acceptInvitation(id) {
  // try {
  // if (!id) throw "invitation id is NULL";

  const response = await fetch(`${endpoint}/relationships/invite/accept/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ "invitation_id": id })
  })
  if (response.ok) {
    console.log("accept invitation succefully");
    const body = await response.json();
    return body;
  }
  else {
    const body = await response.json();
    console.log("Error accepting invitation ", body.message);
    throw body;
  }
  // } catch (error) {
  //   console.log("error", error);
  // }
}

export async function refuseInvitation(id) {
  try {
    // if (!id) throw "invitation id is NULL";

    const response = await fetch(`${endpoint}/relationships/invite/refuse/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ "invitation_id": id })
    })
    if (response.ok) {
      console.log("refuse invitation succefully");
      const body = await response.json();
      return body;
    }
    else {
      const body = await response.json();
      console.log("Error refusing invitation ", body.message);
    }
  } catch (error) {
    console.log("error", error);
  }
}

export async function cancelInvitation(id) {
  try {
    // if (!id) throw "invitation id is NULL";

    const response = await fetch(`${endpoint}/relationships/invite/cancel/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ "invitation_id": id })
    })
    if (response.ok) {
      console.log("cancel invitation succefully");
      const body = await response.json();
      return body;
    }
    else {
      const body = await response.json();
      console.log("Error canceling invitation ", body.message);
      throw body;
    }
  } catch (error) {
    console.log("error", error);
  }
}

export async function unFriend(id) {
  // try {
  // if (!id) throw "invitation id is NULL";

  const response = await fetch(`${endpoint}/relationships/unfriend/`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ "friendship_id": id })
  })
  if (response.ok) {
    console.log("remove friend succefully");
    const body = await response.json();
    return body;
  }
  else {
    const body = await response.json();
    console.log("Error removing friend ", body.message);
    throw body;
  }
  // } catch (error) {
  //   console.log("error", error);
  // }
}


export async function blockUser(id) {
  // try {
  // if (!id) throw "invitation id is NULL";

  const response = await fetch(`${endpoint}/relationships/block/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ "user_id": id })
  })
  if (response.ok) {
    console.log("block user succefully");
    const body = await response.json();
    return body;
  }
  else {
    const body = await response.json();
    console.log("Error blocking user ", body.message);
    throw body;
  }
  // } catch (error) {
  //   console.log("error", error);
  // }
}

export async function unblockUser(id) {
  // try {
  // if (!id) throw "invitation id is NULL";

  const response = await fetch(`${endpoint}/relationships/unblock/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ "block_id": id })
  })
  if (response.ok) {
    console.log("unblock user succefully");
    const body = await response.json();
    return body;
  }
  else {
    const body = await response.json();
    console.log("Error unblock user ", body.message);
    throw body;
  }
  // } catch (error) {
  //   console.log("error", error);
  // }
}

function handleError(err) {
  const Errors = [];
  console.error("err", err);
  if (err.message) Errors.push(err.message);
  else if (err.status === 403) Errors.push("Internal Error");
  else if (typeof err == "object") {
    Object.keys(err).forEach((key) => {
      if (typeof err[key] === "string") Errors.push(err[key]);
      else if (err[key].length && typeof err[key][0] === "string")
        err[key].forEach(elem => Errors.push(`${elem} (${key})`))
      else Errors.push(key);
    });
  }
  Errors.forEach((e, i) => Ura.create(<Toast message={e} delay={i} />))
  if (['9999', '9998'].includes(err.error_code)) Ura.rmCookie("id_key")
  return (err.status == 403);
}

const websocketApi = "http://localhost:8001"
let webSocket = null;

let Events = {

};

function getSocket(type, handler) {


  if (!webSocket) {
    webSocket = new WebSocket(`${websocketApi}/ws/messaging/`);;
    webSocket.onopen = (event) => {
      console.log("WebSocket connection established.");
    };

    webSocket.onmessage = (event) => {
      console.log("Message from server:", event.data);
      const data = JSON.parse(event.data);

      if (data['type'] === type && Events[type]) {
        Events[type](data)
      }
      // if (data['type'] === "friendship_received") {
      //   Ura.create(<Toast message={"new invitation recieved"} delay={1} />)
      //   handler(data["user_id"]);
      // }
    };

    webSocket.onclose = (event) => {
      console.log('WebSocket connection closed');
      Events = {};
    };
  }
  else
    console.log("socker already exists");
  if (type && handler) Events[type] = handler;
  return webSocket;
};

function setUrl(path) {
  window.location.pathname = path
}

const api = {
  endpoint,
  signup,
  login,
  getUser,
  getPicture,
  updateUser,
  getRelations,
  deleteUser,
  searchUser,
  inviteFriend,
  acceptInvitation,
  refuseInvitation,
  unFriend,
  unblockUser,
  blockUser,
  cancelInvitation,
  getUsersById,
  handleError,
  setUrl,
  getSocket
}

export default api