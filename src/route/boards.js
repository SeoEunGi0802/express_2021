import { Router } from "express";
import _ from "lodash";
import faker from "faker";
import sequilize from "sequelize";

const seq = new sequilize("express", "root", "1234", {
    host: "localhost",
    dialect: "mysql",
    // logging: false
});

const Board = seq.define("board", {
    title: {
        type: sequilize.STRING,
        allowNull: false,
    },
    content: {
        type: sequilize.TEXT,
        allowNull: true,
    },
});

// 더미 데이터 생성 함수
const board_sync = async () => {
    try {
        await Board.sync({ force: true });
        for (let i = 0; i < 10000; i++) {
            await Board.create({
                title: faker.lorem.sentences(1),
                content: faker.lorem.sentences(10),
            });
        }
    } catch (err) {
        console.log(err);
    }
};

// board_sync();

const boardRouter = Router();

let boards = [];

// 게시판 전체 조회
boardRouter.get("/", async (req, res) => {
    const boards = await Board.findAll();
    res.send({
        count: boards.length,
        boards,
    });
});

// 게시판 id 값 조회
boardRouter.get("/:id", async (req, res) => {
    try {
        const findBoard = await Board.findOne({
            where: {
                id: req.params.id
            }
        });

        if (findBoard) {
            res.status(200).send({
                // count: findBoard.length,
                findBoard
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

// 게시판 생성
boardRouter.post("/", async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title) {
            res.status(400).send({
                msg: "입력 값이 잘못되었습니다."
            });
        }

        const result = await Board.create({
            title,
            content: content ? content : null
        });

        res.status(200).send({
            msg: `id ${result.id}, ${result.title} 게시글이 생성 되었습니다.`
        });
    } catch (err) {
        res.status(500).send({
            msg: "서버에 문제가 발생했습니다."
        });
    }
});

// 게시글 title, content 변경
boardRouter.put("/:id", async (req, res) => {
    try {
        const { title, content } = req.body;
        let msg = "";

        let boards = await Board.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!boards) {
            res.status(400).send({
                msg: '해당 게시글 존재하지 않거나 입력값이 잘못 되었습니다.'
            });
        } else if (title || content) {
            if (title) {
                boards.title = title;
                msg += `게시글 title이 [${title}]로`;
            }

            if (content) {
                if (title) {
                    msg += ", ";
                }

                boards.content = content;
                msg += `게시글 content가 [${content}]로`;
            }

            msg += "수정되었습니다.";

            await boards.save();

            res.status(200).send({
                msg
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({
            msg: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
        });
    }
});

// 게시글 지우기
boardRouter.delete("/:id", async (req, res) => {
    try {
        let boards = await Board.findOne({
            where: {
                id: req.params.id,
            },
        });

        if (!boards) {
            res.status(400).send({
                msg: "해당 게시글이 존재하지 않습니다."
            });
        }

        await boards.destroy();

        res.status(200).send({
            mgs: "게시글이 정상적으로 삭제 되었습니다."
        });
    } catch (err) {
        res.status(500).send({
            msg: "서버에 문제가 발생했습니다. 잠시 후 시도해 주세요"
        });
    }
});

export default boardRouter;