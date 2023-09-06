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
    const db = await prisma.comment.findMany();
    res.json({ status: 'OK', comment: data.comment });
  } catch (err) {
    console.warn(err);
    res.status(404).json({status: 'ERROR', statusCode: 404, ERROR: err});
  }

});

module.exports = router;