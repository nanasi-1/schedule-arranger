'use strict'
const request = require('supertest');
const app = require('../app');
const passportStub = require('passport-stub');

describe('/login', () => {

    beforeAll(() => {
        passportStub.install(app);
        passportStub.login({ username: 'test_user'});
    })

    test('ログインのためのフォームが含まれる', async () => {
        await request(app).get('/login')

            // 引数を二つ渡した場合はヘッダをテストする
            .expect('Content-Type', 'text/html; charset=utf-8')

            // 引数に正規表現を渡した場合はbodyにその文字列があるかをテストする
            .expect(/<form/)

            // 引数に数値を渡した場合はステータスコードをテストする
            .expect(200)

    })

    test('ログイン時はユーザー名が表示される', async () => {
        await request(app).get('/login')
            .expect(/でログイン中/)
            .expect(200)
    })

    test('ログアウト時はリダイレクトされる', async() => {
        await request(app).get('/logout')
            .expect('Location', '/login')
            .expect(302)
    })

    afterAll(() => {
        passportStub.logout();
        passportStub.uninstall();
    })
})