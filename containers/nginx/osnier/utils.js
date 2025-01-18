export async function getGame(endPoint, game_id) {
    try {
        console.log("THe game id is", game_id);
        const res = await fetch(`${endPoint}/games/played/`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([game_id])
        });
        if (res.ok) {
            const body = await res.json();
            console.log("get game: ", body);
            return body;
        }
        else {
            const body = await res.json();
            console.log("Error getting game : ", body);
        }
    }
    catch (error) {
        console.log("error", error);
    }
}
export async function getUser(endPoint) {
    // get user data
    try {
        const response = await fetch(`${endPoint}/users/`, { credentials: "include" });
        if (response.ok) {
            const body = await response.json();
            console.log("get user succefully", body);
            return body;
        }
        else {
            const body = await response.json();
            console.log("Error get user", body);
        }
    }
    catch (error) {
        console.log("error", error);
    }
}
