import { Router } from "express";
import bcrypt from "bcrypt";
import db from "../models/index.js";
import user from "../models/user.js";

const { User, Board, Permission } = db;

const userRouter = Router();

// user 전체 조회
userRouter.get("/", async (req, res) => {
    try {
        let { name, age } = req.query;
        const { Op } = db.sequelize;

        const findUserQuery = {
            attributes: ["id", "name", "age"],
        }

        let result;

        if (name && age) {
            findUserQuery['where'] = { name, age }
        } else if (name && !age) {
            findUserQuery['where'] = { name }
        } else if (!name && age) {
            findUserQuery['where'] = { age }
        }

        result = await User.findAll(findUserQuery);

        res.status(200).send({
            count: result.length,
            result
        });
    } catch (err) {
        res.status(500).send("");
    }
});

// user id로 조회
userRouter.get("/:id", async (req, res) => {
    try {
        const findUser = await User.findOne({
            // include: [Permission, Board], // 전체 조회
            include: [{
                model: Permission,
                attributes: ["id", "title", "level"]
            }, {
                model: Board,
                attributes: ["id", "title", "content"]
            }],
            where: {
                id: req.params.id
            }
        });

        if (findUser) {
            res.status(200).send({
                // count: findUser.length,
                findUser
            });
        } else {
            res.status(400).send({
                msg: "해당 아이디값을 값을 가진 유저가 없습니다."
            });
        }
    } catch (err) {
        res.status(500).send({
            msg: "서버에 문제가 발생했습니다."
        });
    }
});

// user 생성
userRouter.post("/", async (req, res) => {
    try {
        const { name, age, password, permission } = req.body;

        if (!name || !age || !password || !permission) {
            res.status(400).send({
                msg: "입력 값이 잘못되었습니다."
            });
        } else {
            const hashpwd = await bcrypt.hash(password, 4);

            const result = await User.create({
                name,
                age,
                password: hashpwd
            });

            await result.createPermission({
                title: permission.title,
                level: permission.level
            });

            res.status(200).send({
                msg: `${result.name}님이 생성 되었습니다.`
            });
        }
    } catch (err) {
        res.status(500).send({
            msg: "서버에 문제가 발생했습니다."
        });
    }
});

// user name, age 변경
userRouter.put("/:id", async (req, res) => {
    try {
        const { name, age } = req.body;

        let user = await User.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!user) {
            res.status(400).send({
                msg: '유저가 존재하지 않거나 입력값이 잘못 되었습니다.'
            });
        } else if (name || age) {
            if (name) {
                user.name = name;
                msg += `유저 name이 [${name}]로`;
            }

            if (age) {
                if (age) {
                    msg += ", ";
                }

                user.age = age;
                msg += `유저 age가 [${age}]로`;
            }

            msg += "수정되었습니다.";

            await user.save();

            res.status(200).send({
                msg
            });
        }

        res.status(200).send({
            msg: '유저정보가가 정상적으로 수정 되었습니다.'
        });

    } catch (err) {
        console.log(err);
        res.status(500).send({
            msg: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
        });
    }
});

// user 지우기
userRouter.delete("/:id", async (req, res) => {
    try {
        let user = await User.findOne({
            where: {
                id: req.params.id,
            },
        });
        if (!user) {
            res.status(400).send({
                msg: "해당 유저가 존재하지 않습니다."
            });
        }

        await user.destroy();
        res.status(200).send({
            mgs: "유저가 정상적으로 삭제 되었습니다."
        });
    } catch (err) {
        res.status(500).send({
            msg: "서버에 문제가 발생했습니다. 잠시 후 시도해 주세요"
        });
    }
});

userRouter.get("/test/:id", async (req, res) => {
    try {
        const { Op } = db.sequelize;

        // findAll
        const userResult = await User.findAll({
            // attributes: ["id", "name", "age"],
            where: {
                [Op.or]: [{
                    name: {
                        [Op.startsWith]: "김"
                    },
                    age: {
                        [Op.gte]: 40
                    }
                }, {
                    name: {
                        [Op.startsWith]: "하"
                    },
                    age: {
                        [Op.gte]: 40
                    }
                }]
            },
            order: [["age", "DESC"], ["name", "ASC"]]
        });

        const boardResult = await Board.findAll();

        const user = await User.findOne({
            where: { id: req.params.id }
        });

        const board = await Board.findOne({
            where: { id: req.params.id }
        });

        if (!user || !board) {
            res.status(404).send("해당 정보가 존재하지 않습니다.");
        }

        await user.destory();

        board.title += "test 타이틀입니다.";

        await board.save();

        res.status(200).send({
            user,
            board,
            users: {
                count: userResult.length,
                data: userResult
            },
            boards: {
                count: boardResult.length,
                data: boardResult
            }
        });
    } catch (err) {
        res.status(500).send("서버에 문제가 발생했습니다.");
    }
});

export default userRouter;