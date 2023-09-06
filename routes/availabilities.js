'use strict'

// Web APIを作るらしい

const express = require('express');
const router = express.Router();
const ensurer = require('./authentication-ensurer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: [ 'query' ] });

/* GET availabilities listing. */
router.post('/:scheduleId/candidates/:candidateId', ensurer, async function(req, res, next) {
//router.get('/:scheduleId/candidates/:candidateId/post', async function(req, res, next) {
  /**
   * データをまとめたオブジェクト
   * @type {{userId: string, candidateId: number, scheduleId: uuidv4, availability: number}}
   */
  const data = {
    userId: req.user,
    candidateId: parseInt(req.params.candidateId),
    scheduleId: req.params.scheduleId,
    availability: parseInt(req.body.availability)
  }
  await prisma.availability.upsert({
    where: {
      availabilityCompositeId: { // 複合主キー
        candidateId: data.candidateId,
        userId: data.userId
      }
    },
    create: data,
    update: data
  })
  res.json({status: 'OK', availability: data.availability, about: '出欠を変更するWebAPI'});
});

router.get('/:scheduleId/candidates/:candidateId', async function (req,res) {
  // リクエストされた候補と出欠を取得するAPI
  try {
    const ava = await prisma.availability.findMany({
      where: {
        candidateId: parseInt(req.params.candidateId),
        userId: req.user,
        scheduleId: req.params.scheduleId
      }
    })
    res.json({status: 'OK', ava: ava});
  } catch(err) {
    console.warn(err);
    res.json({status: 'ERROR', about: err});
  }
})

module.exports = router;