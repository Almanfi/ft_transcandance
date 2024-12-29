console.log("hello");

const users = [
  {
    firstname: "mohammed",
    lastname: "hrima",
    username: "mhrima",
    password: "Mhrima123@@",
    display_name: "yuliy"
  },
  // {
  //   firstname: "sara",
  //   lastname: "smith",
  //   username: "ssmith",
  //   password: "SaraSmith456##",
  //   display_name: "sara_s"
  // },
  // {
  //   firstname: "john",
  //   lastname: "doe",
  //   username: "jdoe",
  //   password: "JohnDoe789**",
  //   display_name: "johnny"
  // },
  // {
  //   firstname: "emily",
  //   lastname: "brown",
  //   username: "ebrown",
  //   password: "EmilyBrown101!!",
  //   display_name: "em_brown"
  // }
];

(async () => {
  try {
    // const res = await fetch("/api/users/login/",
    //   { method: "POST", body: JSON.stringify({ name: "aaa" }) })

    // if (res.ok) {
    //   console.log("ok");
    // }
    // else {
    //   const data = await res.text()
    //   console.log("not ok: ", data);
    //   document.body.innerHTML = data
    // }
    users.forEach(async user => {
      const response = await fetch("/api/users/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      if (response.ok) {
        console.log("users created");
      }
      else {
        console.log("Error creating users");
      }
    })
  } catch (error) {
    console.log("error", error);
  }
})()

