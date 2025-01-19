export async function getGame(endPoint: string, game_id: string) {
    try {
      const res = await fetch(`${endPoint}/games/played/`, {
        method: "POST",
        credentials : "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([game_id])
      })
      if (res.ok)
      {
        const body = await res.json();
        return body
      }
      else {
        const body = await res.json();
      }
    }
    catch (error) {
    }
}

export async function getUser(endPoint: string) {
    // get user data
    try {
      const response = await fetch(`${endPoint}/users/`, {credentials: "include"});
      if (response.ok) {
        const body = await response.json();
        return body
      }
      else {
        const body = await response.json();
      }
    } catch (error) {
    }
}