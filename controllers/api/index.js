const router = require('express').Router();

router.get('/', (req, res) => {
    res.render('index.ejs')
});

router.get('/kagiChart/:type', (req, res) => {
    const datas = 'a';
    res.send(datas);
});

router.get('/lineChart/:type', (req, res) => {
    const datas = {
        pathInfos: [{
            class: 'low',   // general, high, middle, low
            values: [
                {x: 1,y: 5},    // x : 시간, y : 데이터(txCount, gasPrice, conformationTime)
                {x: 2,y: 5}, 
                {x: 3,y: 7}
            ]
        }, {
            class: 'low',   // general, high, middle, low
            values: [
                {x: 1,y: 1},    // x : 시간, y : 데이터(txCount, gasPrice, conformationTime)
                {x: 2,y: 3}, 
                {x: 3,y: 9}
            ]
        }],
        xAxis : [1,2,3],        // 시간 배열
        yAxis : {
            min: 1,             // 데이터 최소값
            max: 8             // 데이터 최대값
        }
    };
    res.send(datas);
});

router.get('/barChart/:type', (req, res) => {
    const datas = {
        class: 'general', // general, high, middle, low
        values: [
            {x: 1,y: 5},    // x : 시간, y : 데이터(txCount, gasPrice, conformationTime)
            {x: 2,y: 6}, 
            {x: 3,y: 7}
        ],
        xAxis : [1,2,3],        // 시간 배열
        yAxis : {
            min: 1,             // 데이터 최소값
            max: 10             // 데이터 최대값
        }
    };
    res.send(datas);
});


router.get('/pieChart/:start/:end', (req, res) => {
    const datas = {
        class: 'general', // general, high, middle, low
        values: [
            {x: 1,y: 5},    // x : 시간, y : 데이터(txCount, gasPrice, conformationTime)
            {x: 2,y: 6}, 
            {x: 3,y: 7}
        ],
        xAxis : [1,2,3],        // 시간 배열
        yAxis : {
            min: 1,             // 데이터 최소값
            max: 10             // 데이터 최대값
        }
    };
    res.send(datas);
});


// {
//     pathInfos: [{
//         class: 'general',   // general, high, middle, low
//         values: [
//             {x: 1,y: 5},    // x : 시간, y : 데이터(txCount, gasPrice, conformationTime)
//             {x: 2,y: 5}, 
//             {x: 3,y: 5}
//         ]
//     }],
//     xAxis : [1,2,3],        // 시간 배열
//     yAxis : {
//         min: 1,             // 데이터 최소값
//         max: 10             // 데이터 최대값
//     }
// }


// {
//     rectInfos: [{
//         class: 'general',   // general, high, middle, low
//         values: [
//             {x: 1,y: 5},    // x : 시간, y : 데이터(txCount, gasPrice, conformationTime)
//             {x: 2,y: 5}, 
//             {x: 3,y: 5}
//         ]
//     }],
//     xAxis : [1,2,3],        // 시간 배열
//     yAxis : {
//         min: 1,             // 데이터 최소값
//         max: 10             // 데이터 최대값
//     }
// }
exports.router = router;
