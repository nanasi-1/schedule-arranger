const express = require('express');
const router = express.Router();

/* GET logout listing. */
router.get('/', function(req, res, next) {
  res.send('logout');
});

module.exports = router;