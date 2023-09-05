const express = require('express');
const router = express.Router();
const ensurer = require('./authentication-ensurer');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: [ 'query' ] });

/* GET schedules listing. */
router.get('/new', ensurer ,function(req, res, next) {
  res.render('new', { user: req.user});
});

router.get('/', function (req,res) {
  res.send('ここで予定の観覧ができるよ');
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

module.exports = router;