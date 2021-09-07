import { Router } from "express";
import _ from "lodash";
import faker from "faker";

faker.locale = "ko";

const userRouter = Router();

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.ceil(max);
    return Math.floor(Math.random() * (max - min) + min);
}

// user 기본 데이터
let users = [{
    id: 1,
    name: "길동1",
    age: 21
},
{
    id: 2,
    name: "길동2",
    age: 22
},
{
    id: 3,
    name: "길동3",
    age: 23
},
{
    id: 4,
    name: "길동4",
    age: 24
},
{
    id: 5,
    name: "길동5",
    age: 25
}];

for (let i = 0; i < 1000; i++) {
    users.push({
        id: i,
        name: faker.name.lastName() + faker.name.firstName,
        age: getRandomInt(15,50)
    })
}

let result;

// user 전체 조회
userRouter.get("/", (req, res) => {
    res.send({
        count: users.length,
        users
    });
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
userRouter.post("/", (req, res) => {
    const create_user = req.body
    const check_user = _.find(users, ["id", create_user.id]);

    if (!check_user && create_user.id && create_user.name && create_user.age) {
        users.push(create_user);
        result = `${create_user.name}님을 생성 했습니다.`

        res.status(200).send({
            result
        });
    } else {
        result = `입력 요청값이 잘못되었습니다.`

        res.status(400).send({
            result
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