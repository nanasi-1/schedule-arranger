const express = require('express');
const router = express.Router();
const ensurer = require('./authentication-ensurer');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: [ 'query' ] });

/* GET schedules listing. */
router.get('/new', ensurer, function(req, res, next) {
  res.render('new', {user: req.user});
});

router.get('/', ensurer, async function (req,res) {
  const schedules = await prisma.schedule.findMany({
    where: {createdBy: req.user}, // NOTE 一応置き換えしやすいようにした
    orderBy: { updatedAt: 'desc' }
  });
  console.log(schedules);
  res.render('schedules', {schedules});
})

router.post('/', ensurer , async function (req, res, next) {
  console.log(req.body);
  
  const scheduleId = uuidv4();
  console.log(scheduleId);
  const updateAt = new Date();
  const schedule = await prisma.schedule.create({
    data: {
      scheduleId: scheduleId,
      scheduleName: req.body.scheduleName.slice(0,255) || '名称未設定', // 文字数制限
      memo: req.body.memo,
      createdBy: req.user,
      updatedAt: updateAt
    }
  });

  const candidateNames = req.body.candidates.split('\n').map((s) => s.trim()).filter((s) => s !== '');
  const candidates = candidateNames.map((c) => ({
    candidateName: c,
    scheduleId: schedule.scheduleId
  }));
  await prisma.candidate.createMany({data: candidates})

  res.redirect('/schedules/' + schedule.scheduleId); 
})

router.get('/:scheduleId', ensurer, async (req,res,next) => {
  const schedule = await prisma.schedule.findUnique({
    where: {scheduleId: req.params.scheduleId},
    include: {
      user: {
        select: {
          userId: true,
          username: true
        }
      }
    }
  })
  if (schedule) {
    const candidates = await prisma.candidate.findMany({
      where: { scheduleId: schedule.scheduleId },
      orderBy: { candidateId: 'asc' }
    });
    res.render('schedule', {
      user: req.user,
      schedule: schedule,
      candidates: candidates,
      users: [ req.user ]
    });
  } else {
    const err = new Error('指定された予定は見つかりません');
    err.status = 404;
    next(err);
  }
})

module.exports = router;