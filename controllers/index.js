const router = require('express').Router();

router.get('/', (req, res) => {
    res.render('index.ejs')
});

exports.router = router;