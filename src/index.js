import express from "express";
import _ from "lodash";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.listen(3000);

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

let user;
let result;

app.get("/users", (req, res) => {
    res.send({
        count: users.length,
        users
    });
});

app.get("/users/:id", (req, res) => {
    const find_user = _.find(users, { id: parseInt(req.params.id) });

    if (find_user) {
        result = `정상적으로 조회되었습니다.`

        res.status(200).send({
            result
        });
    } else {
        result = `해당 아이디를 가진 유저가 없습니다.`

        res.status(400).send({
            result
        });
    }
});

// user 생성
app.post("/users", (req, res) => {
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

// name 변경
app.put("/users/:id", (req, res) => {
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
app.delete("/users/:id", (req, res) => {
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