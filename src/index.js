import express from "express";
import userRouter from "./route/users.js"
import boards_router from "./route/boards.js"

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/users", userRouter);
app.use("/boards", boards_router);

app.listen(3000);