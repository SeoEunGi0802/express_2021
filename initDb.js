import bcrypt from "bcrypt";
import faker from "faker";
import db from "./src/models/index.js";

const { User, Board } = db;

faker.locale = "ko";

// 랜덤 숫자 생성
const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

// USER 더미 데이터 생성 함수
const user_sync = async () => {
    await User.sync({ force: true });

    for (let i = 0; i < 1000; i++) {
        const hashpwd = await bcrypt.hash("test1234", 10);
        User.create({
            name: faker.name.lastName() + faker.name.firstName(),
            age: getRandomInt(15, 50),
            password: hashpwd
        });
    }
}

// BOARD 더미 데이터 생성 함수
const board_sync = async () => {
    try {
        await Board.sync({ force: true });
        for (let i = 0; i < 10000; i++) {
            await Board.create({
                title: faker.lorem.sentences(1),
                content: faker.lorem.sentences(10),
                userId: getRandomInt(1, 1000),
            });
        }
    } catch (err) {
        console.log(err);
    }
};

await user_sync();
await board_sync();