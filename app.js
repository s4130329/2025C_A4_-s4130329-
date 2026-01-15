/**
* RMIT University Vietnam
* Course: COSC3060 Web Programming Studio
* Semester: 2025B
* Assessment: Fullstack in-class Lab Test
* Author: Your names (e.g. Nguyen Van Minh)
* ID: Your student ids (e.g. s1234567)
* Acknowledgement: Acknowledge the resources that you use here.
*/

/* 헤더 주석 (Step 1에서 작성한 것) 유지 */

const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config(); // 환경변수 로드
require('./db/mongoose'); // DB 연결 실행

const { Book, ReadingList } = require('./db/bookModel'); // 모델 불러오기

// View engine 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware 설정
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 폴더
app.use(express.urlencoded({ extended: true })); // 폼 데이터 처리
app.use(express.json());

// --- ROUTES ---

// 1. GET / - Homepage (Reading List 보여주기)
app.get('/', async (req, res) => {
    try {
        // 랜덤한 Reading List 하나 가져오기
        // 1. 전체 개수 세기
        const count = await ReadingList.countDocuments();
        // 2. 랜덤한 숫자 생성
        const random = Math.floor(Math.random() * count);
        // 3. 하나 건너뛰고 하나 가져오기 (랜덤 효과)
        const readingList = await ReadingList.findOne().skip(random);

        // list.ejs 렌더링 (readingList 데이터를 보냄)
        res.render('list', { readingList });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// 2. POST / - Refresh Button (새로고침 기능)
app.post('/', async (req, res) => {
    // 단순히 홈으로 리다이렉트하면 GET / 라우트가 실행되면서 다시 랜덤 로딩됨
    res.redirect('/');
});

// 3. GET /book/:id - Book Detail Page
app.get('/book/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        
        // 1. 현재 책 정보 찾기 (모든 ReadingList 안에 있는 books 배열을 뒤져야 함)
        // 실제로는 Book 컬렉션이 따로 있다면 Book.findById(id)가 편함.
        // seed.js 구조상 Book 컬렉션도 채워진다면 아래와 같이 사용:
        const currentBook = await Book.findById(bookId);

        if (!currentBook) {
            return res.status(404).send("Book not found");
        }

        // 2. 같은 카테고리의 다른 책들 찾기 (Related Books)
        const relatedBooks = await Book.find({ 
            category: currentBook.category, 
            _id: { $ne: currentBook._id } // 현재 보고 있는 책은 제외
        }).limit(3); // 3개 정도만 보여줌

        // book.ejs 렌더링
        res.render('book', { currentBook, relatedBooks });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});