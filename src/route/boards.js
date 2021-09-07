import { Router } from "express";
import _ from "lodash";

const boards_router = Router();

// board 기본 데이터
let boards = [{
    id: 1,
    title: "게시판 타이틀 입니다.",
    content: "게시판 내용 입니다.",
    create_date: "2021-09-05",
    update_date: "2021-09-06"
},
{
    id: 2,
        title: "게시판 타이틀 입니다.",
        content: "게시판 내용 입니다.",
        create_date: "2021-09-05",
        update_date: "2021-09-06"
},
{
    id: 3,
    title: "게시판 타이틀 입니다.",
    content: "게시판 내용 입니다.",
    create_date: "2021-09-05",
    update_date: "2021-09-06"
},
{
    id: 4,
    title: "게시판 타이틀 입니다.",
    content: "게시판 내용 입니다.",
    create_date: "2021-09-05",
    update_date: "2021-09-06"
},
{
    id: 5,
    title: "게시판 타이틀 입니다.",
    content: "게시판 내용 입니다.",
    create_date: "2021-09-05",
    update_date: "2021-09-06"
}];

let result;

// board 전체 조회
boards_router.get("/", (req, res) => {
    res.send({
        count: boards.length,
        boards
    });
});

// board id로 조회
boards_router.get("/:id", (req, res) => {
    const find_board = _.find(boards, { id: parseInt(req.params.id) });

    if (find_board) {
        result = `정상적으로 조회되었습니다.`

        res.status(200).send({
            result,
            find_board
        });
    } else {
        result = `해당 아이디를 가진 유저가 없습니다.`

        res.status(400).send({
            result
        });
    }
});

// board 생성
boards_router.post("/", (req, res) => {
    const create_board = req.body
    const check_board = _.find(boards, ["id", create_board.id]);

    if (!check_board && create_board.id && create_board.title && create_board.content) {
        boards.push(create_board);
        result = `게시글 [${create_board.title}]를 작성 했습니다.`

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

// board title 변경
boards_router.put("/:id", (req, res) => {
    const find_board_idx = _.findIndex(boards, ["id", parseInt(req.params.id)]);

    if (find_board_idx !== -1) {
        boards[find_board_idx].title = req.body.title;

        result = `성공적으로 수정 되었습니다.`;

        res.status(200).send({
            result
        });
    } else {
        let result = `아이디가 ${req.params.id}인 게시판이 존재하지 않습니다.`;

        res.status(400).send({
            result
        });
    }
});

// board 지우기
boards_router.delete("/:id", (req, res) => {
    const check_board = _.find(boards, ["id", parseInt(req.params.id)]);

    if (check_board) {
        boards = _.reject(boards, ["id", parseInt(req.params.id)]);

        result = `성공적으로 삭제 되었습니다.`;

        res.status(200).send({
            result
        });
    } else {
        let result = `아이디가 ${req.params.id}인 게시판이 존재하지 않습니다.`;

        res.status(400).send({
            result
        });
    }
});

export default boards_router;