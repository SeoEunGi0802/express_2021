import express from "express";
import _ from "lodash";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.listen(3000);

const users = [{
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
    res.send(user);
});

app.get("/users/:id", (req, res) => {
    const result = _.find(users, { id: parseInt(req.params.id) });
    res.send("user " + req.params.id + " get");
});

// user 생성
app.post("/users", (req, res) => {
    const create_user = req.body

    if (create_user.id && create_user.name && create_user.age) {
        // users.push(user);
        user = create_user;
        result = `${user.name}님을 생성 했습니다.`
    } else {
        result = `입력 요청값이 잘못되었습니다.`
    }

    res.send({
        result
    });
});

// name 변경
app.put("/users/:id", (req, res) => {
    if (user && user.id == req.params.id) {
        user.name = req.body.name
        result = `유저 이름을 ${user.name}으로 변경하였습니다.`
    } else {
        result = `아이디가 ${req.params.id}인 유저가 존재하지 않습니다.`
    }

    res.send({
        result
    });
});

//user 지우기

app.delete("/users/:id", (req, res) => {
    if (user && user.id == req.params.id) {
        user = null;
        result = `아이디가 ${req.params.id}인 유저 삭제`;
    } else {
        let result = `아이디가 ${req.params.id}인 유저가 존재하지 않습니다.`;
    }

    res.send({
        result
    });

});