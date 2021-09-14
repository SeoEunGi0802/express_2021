import { Router } from "express";
import _ from "lodash";
import faker from "faker";
import sequelize from "sequelize"

faker.locale = "ko";

const seq = new sequelize('express', 'root', '1234', {
    host: 'localhost',
    dialect: 'mysql'
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
    }
});

// // 더미 데이터 생성
// const user_sync = async() => {
//     await User.sync({ force: true });

//     for (let i = 0; i < 100; i++) {
//         User.create({
//             name: faker.name.lastName() + faker.name.firstName(),
//             age: getRandomInt(15, 50)
//         });
//     }
// }

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

        res.status(200).send({
            count: result.length,
            result
        });
    } catch (err) {
        res.status(500).send("");
    }
});

// user id로 조회
userRouter.get("/:id", (req, res) => {
    const find_user = _.find(users, { id: parseInt(req.params.id) });

    if (find_user) {
        result = `정상적으로 조회되었습니다.`

        res.status(200).send({
            result,
            find_user
        });
    } else {
        result = `해당 아이디를 가진 유저가 없습니다.`

        res.status(400).send({
            result
        });
    }
});

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

// name name 변경
userRouter.put("/:id", (req, res) => {
    const find_user_idx = _.findIndex(users, ["id", parseInt(req.params.id)]);

    if (find_user_idx !== -1) {
        users[find_user_idx].name = req.body.name;

        result = `성공적으로 수정 되었습니다.`;

        res.status(200).send({
            result
        });
    } else {
        let result = `아이디가 ${req.params.id}인 유저가 존재하지 않습니다.`;

        res.status(400).send({
            result
        });
    }
});

// user 지우기
userRouter.delete("/:id", (req, res) => {
    const check_user = _.find(users, ["id", parseInt(req.params.id)]);

    if (check_user) {
        users = _.reject(users, ["id", parseInt(req.params.id)]);

        result = `성공적으로 삭제 되었습니다.`;

        res.status(200).send({
            result
        });
    } else {
        let result = `아이디가 ${req.params.id}인 유저가 존재하지 않습니다.`;

        res.status(400).send({
            result
        });
    }
});

export default userRouter;