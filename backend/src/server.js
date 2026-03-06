import app from "./app.js";
import dbConnect from "./configs/db.config.js";
import config from "./configs/env.config.js";

const PORT = config.port;

const startServer = async () => {
  dbConnect()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((e) => console.log(e.message));
};

startServer();
