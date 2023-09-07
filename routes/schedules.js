const express = require('express');
const router = express.Router();
const ensurer = require('./authentication-ensurer');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query'] });

/* GET schedules listing. */
router.get('/new', ensurer, function (req, res, next) {
  res.render('new', { user: req.user });
});

router.get('/', async function (req, res) {
  /**
   * 予定のデータ
   * @type {{
   *  scheduleId: uuidv4, 
   *  scheduleName: string,
   *  memo: string,
   *  createdBy: string,
   *  updatedAt: data
   * }}
   */
  const schedules = await prisma.schedule.findMany({
    where: { createdBy: req.user || '*' }, // NOTE 一応置き換えしやすいようにした
    orderBy: { updatedAt: 'desc' }
  });
  res.render('schedules', { schedules });
})

router.post('/', ensurer, async function (req, res, next) {
  console.log(req.body);

  const scheduleId = uuidv4();
  const updateAt = new Date();
  const schedule = await prisma.schedule.create({
    data: {
      scheduleId: scheduleId,
      scheduleName: req.body.scheduleName.slice(0, 255) || '名称未設定', // 文字数制限
      memo: req.body.memo,
      createdBy: req.user,
      updatedAt: updateAt
    }
  });

  await createCanName(req.body.candidate, schedule.scheduleId);
  res.redirect('/schedules/' + schedule.scheduleId);
})

router.get('/:scheduleId', ensurer, async (req, res, next) => {
  /**
   * 予定のデータ
   * @type {{
   *  scheduleId: uuidv4,
   *  scheduleName: string,
   *  memo: string,
   *  createdBy: string,
   *  updatedAt: data,
   *  user: { userId: string, username: string}
   * }}
   */
  const schedule = await prisma.schedule.findUnique({
    where: { scheduleId: req.params.scheduleId },
    include: {
      user: {
        select: {
          userId: true,
          username: true
        }
      }
    }
  })

  if (schedule) { // 予定があるかどうかチェック

    /**
     * 候補のデータ
     * @type {{ candidateId: number, candidateName: string, scheduleId: uuidv4}[]}
     */
    const candidates = await prisma.candidate.findMany({
      where: { scheduleId: schedule.scheduleId },
      orderBy: { candidateId: 'asc' }
    });

    /**
     * 出欠のデータ
     * @type {Array<{user: {userId: string, username: string}}> | undefined}
     */
    const availabilities = await prisma.availability.findMany({
      where: { scheduleId: schedule.scheduleId },
      orderBy: { candidateId: 'asc' },
      include: {
        user: {
          select: {
            userId: true,
            username: true
          }
        }
      }
    })

    /**
     * 出欠MapMap
     * key: userId, value: Map(key: candidateId, value: availability)
     * @type {Object.<string, Object.<string,(0 | 1 | 2)>>}
     */
    const availabilityMapMap = new Map();
    availabilities.forEach(ava => {
      const map = availabilityMapMap.get(ava.user.userId) || new Map();
      map.set(ava.candidateId, ava.availability);
      availabilityMapMap.set(ava.user.userId, map)
    });

    /**
     * ユーザ情報のマップ
     * key: userId, value: User
     * @type {Object.<string, {isSelf: boolean, userId: string, username: string}>}
     */
    const userMap = new Map();
    userMap.set(req.user, {
      isSelf: true,
      userId: req.user,
      username: req.user
    });

    availabilities.forEach(a => {
      userMap.set(a.user.userId, {
        isSelf: req.user === a.user.userId, // 地震であるかどうかを示す真偽値
        userId: a.user.userId,
        username: a.user.username
      });
    });

    // 全ユーザ、全候補で二重ループしてそれぞれの出欠の値がない場合には、「欠席」を設定する
    /**
     * ユーザ情報が入った配列
     * @type {{isSelf: boolean, userId: string, username: string}[]}
     */
    const users = Array.from(userMap.values());
    users.forEach((u) => {
      candidates.forEach((c) => {
        const map = availabilityMapMap.get(u.userId) || new Map();
        const a = map.get(c.candidateId) || 0; // デフォルト値は 0 を使用
        map.set(c.candidateId, a);
        availabilityMapMap.set(u.userId, map);
      });
    });

    /**
     * コメントが入った配列
     * @type {{comment: string, scheduleId: uuidv4, userId: string}[]}
     */
    const comments = await prisma.comment.findMany({
      where: { scheduleId: schedule.scheduleId }
    })
    /**
     * コメントが入った連想配列
     * key: ユーザID、value: コメント内容
     * @type {Object.<string,string>}
     */
    const commentMap = new Map();
    comments.forEach(c => {
      commentMap.set(c.userId, c.comment);
    });
    // どうやらコメントは一人一つらしい

    res.render('schedule', {
      user: req.user,
      schedule: schedule,
      candidates: candidates,
      users: users,
      availabilityMapMap: availabilityMapMap,
      commentMap: commentMap
    });

  } else {
    const err = new Error('指定された予定は見つかりません');
    err.status = 404;
    next(err);
  }
})

router.get('/:scheduleId/edit', async function (req, res, next) {

  /**
   * 予定のデータ
   * @type {{
   *  scheduleId: uuidv4, 
   *  scheduleName: string,
   *  memo: string,
   *  createdBy: string,
   *  updatedAt: data
   * }}
   */
  const schedule = await prisma.schedule.findUnique({
    where: { scheduleId: req.params.scheduleId }
  });

  if ((req.user || 'admin') === schedule.createdBy) { // 作成者のみが編集ページを開ける
    /**
     * 候補一覧
     * @type {{ candidateId: number, candidateName: string, scheduleId: uuidv4 }[]}
     */
    const candidates = await prisma.candidate.findMany({
      where: { scheduleId: schedule.scheduleId },
      orderBy: {candidateId: 'asc'}
    })

    res.render('edit', {
      user: req.user,
      schedule: schedule,
      candidates: candidates
    })
  } else {
    const err = new Error('指定された予定が見つからないか、予定の編集権限がありません');
    err.status = 404;
    next(err);
  }
})

router.post('/:scheduleId/update', function (req,res,next) {
  res.send(req.body);
})

/**
 * 候補の文字列から候補のデータベースを更新する関数
 * @param {req.body.candidates} candidateString 
 * @param {schedule.scheduleId} scheduleId
 * @returns {{candidateName: candidate, scheduleId: scheduleId}[]}
 */
async function createCanName(candidateString, scheduleId) {
  const Names = candidates.split('\n').map(s => s.trim()).filter(s => s !== '');
  const candidates =  Names.map((c) => ({
    candidateName: c,
    scheduleId: scheduleId
  }));
  await prisma.candidate.createMany({ data: candidates }); // 更新
}

module.exports = router;