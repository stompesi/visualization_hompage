const router = require('express').Router();

router.get('/', (req, res) => {
    res.render('index.ejs')
});

router.get('/project', (req, res) => {
    res.render('project.ejs')
});

router.get('/team', (req, res) => {
    res.render('team.ejs')
});
exports.router = router;