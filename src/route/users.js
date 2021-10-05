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

// // user id로 조회
// userRouter.get("/:id", (req, res) => {
//     const find_user = _.find(users, { id: parseInt(req.params.id) });

//     if (find_user) {
//         result = `정상적으로 조회되었습니다.`

//         res.status(200).send({
//             result,
//             find_user
//         });
//     } else {
//         result = `해당 아이디를 가진 유저가 없습니다.`

//         res.status(400).send({
//             result
//         });
//     }
// });

// user 생성
userRouter.post("/", async (req, res) => {
    try {
        const { name, age } = req.body;

        if (!name || !age) {
            res.status(400).send({
                msg: "입력 값이 잘못되었습니다."
            });
        }

        const result = await User.create({
            name,
            age
        });

        res.status(200).send({
            msg: `${name}님이 생성 되었습니다.`
        });
    } catch (err) {
        res.status(500).send({
            msg: "서버에 문제가 발생했습니다."
        });
    }
});

// user name 변경
userRouter.put("/:id", async (req, res) => {
    try {
        const updateUser = req.params.id;
        const updateUserName = req.body.name;
        const updateUserAge = req.body.age;
        const { Op } = sequilize;

        if (!updateUser || (!updateUserName && !updateUserAge)) {
            res
                .status(400)
                .send("유저가 존재하지 않거나 입력 요청이 잘못되었습니다.");
        }

        const findUserQuery = await User.findOne({
            where: {
                id: { [Op.eq]: updateUser },
            },
        });

        let updateUserQuery;

        if (updateUserName && updateUserAge) {
            updateUserQuery = await User.update(
                { name: updateUserName, age: updateUserAge },
                {
                    where: {
                        id: { [Op.eq]: updateUser },
                    },
                }
            );
        } else if (updateUserName) {
            updateUserQuery = await User.update(
                { name: updateUserName },
                {
                    where: {
                        id: { [Op.eq]: updateUser },
                    },
                }
            );
        } else if (updateUserAge) {
            updateUserQuery = await User.update(
                { age: updateUserAge },
                {
                    where: {
                        id: { [Op.eq]: updateUser },
                    },
                }
            );
        }
        res.status(200).send({
            msg: `${updateUser}님 수정을 완료하였습니다.`,
        });
    } catch (err) {
        res.status(500).send(err);
    }
});

// user 지우기
userRouter.delete("/:id", async (req, res) => {
    //auth체크 + 권한, 본인 체크
    try {
        let user = await User.findOne({
            where: {
                id: req.params.id,
            },
        });
        if (!user) {
            res.status(400).send({
                msg: "유저가 존재하지 않습니다."
            });
        }

        await user.destroy();
        res.status(200).send({
            mgs: "유저정보가 정상적으로 삭제 되었습니다."
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