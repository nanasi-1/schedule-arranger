const express = require('express');
const router = express.Router();
const ensurer = require('./authentication-ensurer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: [ 'query' ] });

/* GET comments listing. */
router.get('/', function(req, res, next) {
  res.send('ここはコメント処理ページ。');
});

module.exports = router;