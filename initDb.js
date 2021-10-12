import bcrypt from "bcrypt";
import faker from "faker";
import db from "./src/models/index.js";

const { User, Board, Permission } = db;

faker.locale = "ko";

const user_count = 1000;
const board_count = user_count * 0.3 * 365;

const permissions = [
    {
        title: "관리자",
        level: 0,
        desc: "관리자 권한"
    },
    {
        title: "게시판 관리자",
        level: 1,
        desc: "게시판 관리자 권한"
    },
    {
        title: "사용자 관리자",
        level: 2,
        desc: "사용자 관리자 권한"
    },
    {
        title: "일반 사용자",
        level: 3,
        desc: "일반 사용자 권한"
    },
    {
        title: "게스트",
        level: 4,
        desc: "게스트 권한"
    }
];

// PERMISSION 더미 데이터 생성 함수
const permission_sync = async () => {
    try {
        for (let i = 0; i < permissions.length; i++) {
            const { title, level, desc } = permissions[i];

            Permission.create({
                title,
                level,
                desc
            });
        }
    } catch (err) {
        console.log(err);
    }
}

// 랜덤 숫자 생성
const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min) + min);
}

// USER 더미 데이터 생성 함수
const user_sync = async () => {
    try {
        for (let i = 0; i < user_count; i++) {
            const hashpwd = await bcrypt.hash("test1234", 4);

            await User.create({
                name: faker.name.lastName() + faker.name.firstName(),
                age: getRandomInt(15, 50),
                password: hashpwd,
                permissionId: getRandomInt(1, 5)
            });

            if (i % 100 === 0) {
                console.log(`${i}/${user_count}`)
            }
        }
    } catch (err) {
        console.log(err);
    }
}

// BOARD 더미 데이터 생성 함수
const board_sync = async () => {
    try {
        for (let i = 0; i < board_count; i++) {
            await Board.create({
                title: faker.lorem.sentences(1),
                content: faker.lorem.sentences(10),
                userId: getRandomInt(1, user_count),
            });

            if (i % 100 === 0) {
                console.log(`${i}/${board_count}`)
            }
        }
    } catch (err) {
        console.log(err);
    }
};

db.sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true })
    .then(async () => {
        await db.sequelize.sync({ force: true })
        await permission_sync();
        console.log("permission 생성 완료");
        await user_sync();
        console.log("user 생성 완료");
        await board_sync();
        console.log("board 생성 완료");
        process.exit();
    });