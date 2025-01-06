
const endpoint = "https://localhost:8000";

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
	  credentials: 'include'
    });
    if (response.ok) {
	  const body = await response.json();
      console.log("user login succefully", body);
	  return body
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
    const response = await fetch(`${endpoint}/users/`, {credentials: "include"});
    if (response.ok) {
      const body = await response.json();
      console.log("get user succefully", body);
	  return body
    }
    else {
      const body = await response.json();
      console.log("Error get user", body);
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
      body: JSON.stringify({ "search_term": searchTerm }),
	  credentials: "include"
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
      body: JSON.stringify(data),
	  credentials: "include"
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
    /* 
    data than can be changed:
    display_name, firstname, lastname, profile_picture, username
    */
    const response = await fetch(`${endpoint}/users/`, {
      method: "DELETE",
	  credentials: "include"
    })
    if (response.ok) {
      console.log("user deleted succefully");
    }
    else {
      const body = await response.json();
      console.log("Error deleting user", body);
    }
  } catch (error) {
    console.log("error", error);
  }
}

export async function InviteFriend(friendId) {
  try {
    const response = await fetch(`${endpoint}/relationships/invite/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ "friend_id": friendId }),
	  credentials: "include"
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
    const response = await fetch(`${endpoint}/relationships/`, {credentials: "include"});
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
      body: JSON.stringify({ "invitation_id": id }),
	  credentials: "include"
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
      body: JSON.stringify({ "invitation_id": id }),
	  credentials: "include"
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
      body: JSON.stringify({ "invitation_id": id }),
	  credentials: "include"
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
      body: JSON.stringify({ "friendship_id": id }),
	  credentials: "include"
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
      body: JSON.stringify({ "user_id": id }),
	  credentials: "include"
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
      body: JSON.stringify({ "block_id": id }),
	  credentials: "include"
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

export async function  createGame() {
	try {
		const response = await fetch(`${endpoint}/games/`, {
		  method: "POST",
		  credentials: "include"
		})
		if (response.ok) {
			const body = await response.json();
			console.log("Game created Sucesfully: ", body);
			return body;
		}
		else {
		  const body = await response.json();
		  console.log("Error Creating Game: ", body);
		}
	} catch (error) {
		console.log("error", error);
	}
}

export async function getGameInvites()
{
	try {
		const response = await fetch(`${endpoint}/games/`, {
			method: "GET",
			credentials:"include"
		})
		if (response.ok) {
			const body = await response.json();
			console.log("Get game invites Sucesfull: ", body);
			return body;
		}
		else {
		  const body = await response.json();
		  console.log("Error get Game invites : ", body);
		}
	}
	catch (error) {
		console.log("error", error);
	}
}

export async function invitePlayer(game_id, invited_id)
{
	try {
		const res = await fetch(`${endpoint}/games/invite/`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ game_id, invited_id }),
			credentials : "include"
		})
		if (res.ok)
		{
			const body = await res.json();
			console.log("invited player: ", body)
			return body
		}
		else {
			const body = await res.json();
			console.log("Error invite player : ", body);
		}
	}
	catch (error) {
		console.log("error", error);
	}
}

export async function  cancelGameInvite(invite_id) {
	try {
		const res = await fetch(`${endpoint}/games/invite/cancel/`, {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ invite_id }),
			credentials : "include"
		})
		if (res.ok)
		{
			const body = await res.json();
			console.log("canceled game invite: ", body)
			return body
		}
		else {
			const body = await res.json();
			console.log("Error canceling game invite: ", body);
		}
	}
	catch (error) {
		console.log("error", error);
	}
}

export async function acceptGameInvite(invite_id) {
	try {
		const res = await fetch(`${endpoint}/games/invite/accept/`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ invite_id }),
			credentials : "include"
		})
		if (res.ok)
		{
			const body = await res.json();
			console.log("accepted game invite: ", body)
			return body
		}
		else {
			const body = await res.json();
			console.log("Error accepting game invite : ", body);
		}
	}
	catch (error) {
		console.log("error", error);
	}
}

export async function refuseGameInvite(invite_id) {
	try {
		const res = await fetch(`${endpoint}/games/invite/refuse/`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ invite_id }),
			credentials : "include"
		})
		if (res.ok)
		{
			const body = await res.json();
			console.log("refused game invite: ", body)
			return body
		}
		else {
			const body = await res.json();
			console.log("Error refusing game invite : ", body);
		}
	}
	catch (error) {
		console.log("error", error);
	}
}