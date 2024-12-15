// import express from "express";
// import path from "path";

// const app = express();

// // Serve static files from the "public" directory
// app.use(express.static(path.join(__dirname, "public")));

// app.get("*", async (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

// app.listen(8000, () => {
//   console.log("Listening on port 8000");
// });

var a = 1

const f = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      a = 10;
      console.log("a is : " + a);
      resolve();
      }, 1000);
  })
    
}

await f();

console.log(a);

