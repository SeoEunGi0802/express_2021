import { Router } from "express";
import _ from "lodash";
import faker from "faker";
import bcrypt from "bcrypt";
import sequelize from "sequelize";

faker.locale = "ko";

const seq = new sequelize('express', 'root', '1234', {
    host: 'localhost',
    dialect: 'mysql',
    // logging: false
});

const check_seqlize_auth = async () => {
    try {
        await seq.authenticate();
        console.log("DB 연결 성공");
    } catch (err) {
        console.log("DB 연결 실패 : ", err);
    }
}

check_seqlize_auth();

const User = seq.define("user", {
    name: {
        type: sequelize.STRING,
        allowNull: false
    },
    age: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    password: {
        type: sequelize.STRING,
        allowNull: false
    }
});

const initDB = async () => {
    await User.sync()
}

initDB();

// 더미 데이터 생성 함수
const user_sync = async () => {
    await User.sync({ force: true });

    for (let i = 0; i < 10000; i++) {
        const hashpwd = await bcrypt.hash("test1234", 10);
        User.create({
            name: faker.name.lastName() + faker.name.firstName(),
            age: getRandomInt(15, 50),
            password: hashpwd
        });
    }
}

// user_sync();

const userRouter = Router();

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.ceil(max);
    return Math.floor(Math.random() * (max - min) + min);
}

let result;

// user 전체 조회
userRouter.get("/", async (req, res) => {
    let { name, age } = req.query;
    const { Op } = sequelize;

    // // 내꺼 소스
    // const result = await User.findAll({
    //     attributes: ["name", "age"],
    //     where: {
    //         [Op.and]: [
    //             (name ? {name: name} : (age ? {age: age} : {name:name}, {age: age}))
    //         ]
    //     }
    // });

    // res.send({
    //     result
    // });

    // 교수님 소스
    try {
        const findUserQuery = {
            attributes: ["name", "age"],
        }

        let result;

        if (name && age) {
            findUserQuery['where'] = { name: { [Op.substring]: name }, age }
        } else if (name) {
            findUserQuery['where'] = { name: { [Op.substring]: name } }
        } else if (age) {
            findUserQuery['where'] = { age }
        }

        result = await User.findAll(findUserQuery);

        // result = await User.findAll({
        //     where: { name, age }
        // });

        // User.findOne()

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
                msg: "해당 아이디값을 값을 가진 게시글이 없습니다."
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
        const { name, age, password } = req.body;

        if (!name || !age || !password) {
            res.status(400).send({
                msg: "입력 값이 잘못되었습니다."
            });
        }

        const result = await User.create({
            name,
            age,
            password
        });

        res.status(200).send({
            msg: `${result.name}님이 생성 되었습니다.`
        });
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
    const { Op } = sequelize;

    try {
        // findAll
        const userResult = await User.findAll({
            // attributes: ["id", "name", "age"]
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