import express from "express";
import userRouter from "./route/users.js";
import boardRouter from "./route/boards.js";

import db from './models/index.js';

const app = express();

if (process.env.NODE_ENV === "development") {
    db.sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true })
        .then(() => {
            db.sequelize.sync().then(() => {
                console.log("개발환경 sync 끝");

                app.use(express.json());

                app.use(express.urlencoded({ extended: true }));

                app.use("/users", userRouter);

                app.use("/boards", boardRouter);

                app.listen(3000);
            });
        });
} else if (process.env.NODE_ENV === "production") {
    db.sequelize.sync().then(() => {
        console.log("사용환경 sync 끝");

        app.use(express.json());

        app.use(express.urlencoded({ extended: true }));

        app.use("/users", userRouter);

        app.use("/boards", boardRouter);

        app.listen(3000);
    });
}
