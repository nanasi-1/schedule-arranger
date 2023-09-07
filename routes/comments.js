'use strict'

const express = require('express');
const router = express.Router();
const ensurer = require('./authentication-ensurer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query'] });

// コメントを追加するWebAPIになるらしい

/* GET comments listing. */
router.post('/:scheduleId/comments', ensurer, async function (req, res, next) {
  try {
    const data = {
      userId: req.user,
      scheduleId: req.params.scheduleId,
      comment: (req.body.comment).slice(0, 255)
    };
    await prisma.comment.upsert({
      where: { commentCompositeId: { userId: data.userId, scheduleId: data.scheduleId } },
      update: data,
      create: data
    });
    res.json({ status: 'OK', comment: data.comment });
  } catch (err) {
    //res.status(404).json({status: 'ERROR', statusCode: 404, ERROR: err});
    err.status = 404;
    next(err);
  }
});

router.get('/:scheduleId/comments', async function (req, res, next) {
  try {
    const db = await prisma.comment.findMany({
      where: {scheduleId: req.params.scheduleId}
    });
    res.json({ status: 'OK', comment: db });
  } catch (err) {
    res.status(404).json({status: 'ERROR', statusCode: 404, ERROR: 'お探しの予定は見つかりませんでした'});
  }
})

module.exports = router;