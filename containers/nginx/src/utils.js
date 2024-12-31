
const endpoint = "https://localhost:8000/api";

export async function Signup(user) {
  try {
    const response = await fetch(`${endpoint}/users/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    if (response.ok) {
      console.log("user created succefully");
      const body = await response.json();
      return body;
    }
    else {
      const body = await response.json();
      console.log("Error creating users", body.message);
    }
  } catch (error) {
    console.log("error", error);
  }
}

export async function Login(user) {
  try {
    const response = await fetch(`${endpoint}/users/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    if (response.ok) {
      console.log("user login succefully");
    }
    else {
      const body = await response.json();
      console.log("Error login users", body.message);
    }
  } catch (error) {
    console.log("error", error);
  }
}

let userData = localStorage.getItem("user");
if (userData) userData = JSON.parse(userData);

export async function getUser() {
  // get user data
  try {
    const response = await fetch(`${endpoint}/users`);
    if (response.ok) {
      const body = await response.json();
      console.log("get user succefully", body);
      userData = body;
      localStorage.setItem("user", JSON.stringify(userData))
    }
    else {
      const body = await response.json();
      console.log("Error get user", body.message);
    }
  } catch (error) {
    console.log("error", error);
  }
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

export async function searchUser(searchTerm) {
  try {
    const response = await fetch(`${endpoint}/users/search/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "search_term": searchTerm })
    })
    if (response.ok) {
      const body = await response.json();
      console.log("searched user succesfully", body);
      return body;
    }
    else {
      const body = await response.json();
      console.log("Error get user", body.message);
    }
  }
  catch (error) {
    console.log("error", error);
  }
}

export async function getPicture() {
  try {
    if (!userData) throw "user data is null"
    console.log("fetch", userData.profile_picture);

    const response = await fetch(`${endpoint}/${userData.profile_picture}`)
    if (response.ok) {
      const body = await response.blob();
      console.log("hello", body);
      const imageUrl = URL.createObjectURL(body);
      return imageUrl
    }
    else {
      const body = await response.json();
      console.log("Error get picture", body.message);
    }
  } catch (error) {
    console.log("error", error);
  }
}

export async function updateUser(data) {
  try {
    if (!userData) throw "user data is null"
    /* 
    data than can be changed:
    display_name, firstname, lastname, profile_picture, username
    */
    const response = await fetch(`${endpoint}/users/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    })
    if (response.ok) {
      console.log("user updated succefully");
    }
    else {
      const body = await response.json();
      console.log("Error update user", body.message);
    }
  } catch (error) {
    console.log("error", error);
  }
}

export async function deleteUser() {
  try {
    if (!userData) throw "user data is null"
    /* 
    data than can be changed:
    display_name, firstname, lastname, profile_picture, username
    */
    const response = await fetch(`${endpoint}/users/`, {
      method: "DELETE",
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

export async function InviteFriend(friendId) {
  try {
    console.log("ask", { "friend_id": friendId });

    const response = await fetch(`${endpoint}/relationships/invite/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ "friend_id": friendId })
    })
    if (response.ok) {
      console.log("invited friend succefully");
      const body = await response.json();
      return body;
    }
    else {
      const body = await response.json();
      console.log("Error inviting friend", body.message);
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
    invited:[], // peoplewho sent me invitations
    invites: [], // people whom I send invitations
  }
  */
  try {
    const response = await fetch(`${endpoint}/relationships`);
    if (response.ok) {
      console.log("fetting relations succefully");
      const body = await response.json();
      return body;
    }
    else {
      const body = await response.json();
      console.log("Error getting relations", body.message);
    }
  } catch (error) {
    console.log("error", error);
  }
}
// 'invite/accept/'
export async function acceptInvitation(id) {
  try {
    if (!id) throw "invitation id is NULL";

    const response = await fetch(`${endpoint}/relationships/invite/accept/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
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
    }
  } catch (error) {
    console.log("error", error);
  }
}

export async function refuseInvitation(id) {
  try {
    if (!id) throw "invitation id is NULL";

    const response = await fetch(`${endpoint}/relationships/invite/refuse/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
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
    if (!id) throw "invitation id is NULL";

    const response = await fetch(`${endpoint}/relationships/invite/cancel/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
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
    }
  } catch (error) {
    console.log("error", error);
  }
}

export async function removeFriend(id) {
  try {
    if (!id) throw "invitation id is NULL";

    const response = await fetch(`${endpoint}/relationships/unfriend/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
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
    }
  } catch (error) {
    console.log("error", error);
  }
}


export async function blockUser(id) {
  try {
    if (!id) throw "invitation id is NULL";

    const response = await fetch(`${endpoint}/relationships/block/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    }
  } catch (error) {
    console.log("error", error);
  }
}

export async function unblockUser(id) {
  try {
    if (!id) throw "invitation id is NULL";

    const response = await fetch(`${endpoint}/relationships/unblock/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
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
    }
  } catch (error) {
    console.log("error", error);
  }
}
