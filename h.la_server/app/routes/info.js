var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.send("/info/{번호}");
})
router.get('/random', async function(req, res, next) {
    res.render('info', { number: "Random" });
});
router.get('/:number', async function(req, res, next) {
    res.render('info', { number: req.params.number });
});

module.exports = router;
