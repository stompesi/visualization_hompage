const router = require('express').Router();
const mysql      = require('mysql');
const dbConfig = {
	  host     : 'localhost',
	  user     : 'root',
	  password : 'gkswhdqls',
	  database : 'visualization'
};
let connection;

function handleDisconnect() {
  connection = mysql.createConnection(dbConfig);

  connection.connect(function(err) {
    if(err){
      console.log('Err : ', err);
      setTimeout(handleDisconnect, 2000);
    }
  });

  connection.on('error', function(err){
    console.log('DB drror', err);

    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

router.get('/update/:start', (req, res) => {
    let start = req.params.start - 0;
    let end = start + (900); 
    console.log('Start', start, end);
    
    update(start, end);
    
});

function update(start, end) {
    const query = `SELECT * FROM BLOCK_PER_15_MINUTES WHERE TIMESTAMP = ${start};`

    connection.query(query, 
    function (error, results1, fields) {
        if (error) {
            console.log(error);
            return ;
        }

        if(results1.length != 0) {
            start = end;
            end = start + (900);
            update(start, end);
            return;
        }
        const query = `SELECT SUM(CONV(SUBSTRING(GAS_USED,3),16,10)) AS GAS_USED, SUM(TRANSACTION_COUNT) AS TRANSACTION_COUNT, AVG(AVG_GAS_PRICE) AS AVG_GAS_PRICE, 
        MIN(LOW_GAS_PRICE) AS LOW_GAS_PRICE, MAX(HIGH_GAS_PRICE) AS HIGH_GAS_PRICE FROM BLOCK WHERE TIMESTAMP2 >= ${start} AND TIMESTAMP2 <= ${end} AND LOW_GAS_PRICE != 0;`
    
        connection.query(query, 
        function (error, results, fields) {
            if (error) {
                console.log(error);
                return ;
            }
            //console.log(query, results[0]);
            if(results.length != 0 && results[0].GAS_USED != null) {
                const query = `INSERT INTO BLOCK_PER_15_MINUTES 
                (TIMESTAMP, GAS_USED, TRANSACTION_COUNT, AVG_GAS_PRICE, HIGH_GAS_PRICE, LOW_GAS_PRICE) 
                VALUES (${start}, ${results[0].GAS_USED}, ${results[0].TRANSACTION_COUNT}, ${results[0].AVG_GAS_PRICE}, ${results[0].HIGH_GAS_PRICE}, ${results[0].LOW_GAS_PRICE})`
    
                connection.query(query, 
                function (error, results1, fields) {
                    if (error) {
                        console.log(error);
                        return ;
                    }
                    console.log(start, results[0].GAS_USED, results[0].TRANSACTION_COUNT, results[0].AVG_GAS_PRICE, 
                        results[0].LOW_GAS_PRICE, results[0].HIGH_GAS_PRICE);
                    start = end;
                    end = start + (900);
                    update(start, end);
                });
            } else {
                console.log('end');
                return;
            }
        });
    });
   
}

router.get('/kagiChart/:type/:start/:end', (req, res) => {
    const type = req.params.type;
    const start = req.params.start;
    let end = req.params.end;

    if(type == "avg") {
        connection.query(`SELECT TIMESTAMP2 AS date, AVG_GAS_PRICE AS close FROM BLOCK WHERE TIMESTAMP2 >= ${start} AND TIMESTAMP2 <= ${end} ORDER BY TIMESTAMP2 ASC LIMIT 300;`, function (error, results, fields) {
            if (error) return res.send([]);
    
            for(let i = 0 ; i < results.length ; i++) {
                const date = new Date(results[i].date * 1000);
                results[i].date = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
            }

            return res.send(results);
        });
    } else if(type == "high") {
        connection.query(`SELECT TIMESTAMP2 AS date, HIGH_GAS_PRICE AS close FROM BLOCK WHERE TIMESTAMP2 >= ${start} AND TIMESTAMP2 <= ${end} ORDER BY TIMESTAMP2 ASC LIMIT 300;`, function (error, results, fields) {
            if (error) return res.send([]);
    
            for(let i = 0 ; i < results.length ; i++) {
                const date = new Date(results[i].date * 1000);
                results[i].date = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
            }

            return res.send(results);
        });
    } else {
        connection.query(`SELECT TIMESTAMP2 AS date, LOW_GAS_PRICE AS close FROM BLOCK WHERE TIMESTAMP2 >= ${start} AND TIMESTAMP2 <= ${end} ORDER BY TIMESTAMP2 ASC LIMIT 300;`, function (error, results, fields) {
            if (error) return res.send([]);
    
            for(let i = 0 ; i < results.length ; i++) {
                const date = new Date(results[i].date * 1000);
                results[i].date = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
            }
            
            return res.send(results);
        });
    }
});


function getDate(date) {
    return '' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
};

function getTime(date) {
    return '' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}

function getDateTime(date) {
    return '' + date.getDate() + '('+ date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ')';
}


router.get('/lineChart/:type/:start/:end', (req, res) => {
    const type = req.params.type;
    const start = req.params.start;
    let end = req.params.end;
    const datas = {
        pathInfos: [],
        xAxis: [],
        yAxis: {
            min: Infinity,
            max: -1
        }
    };

    let convertor = null;
    let table = null;

    if (end - start > 7 * 24 * 60 * 60) {
        convertor =  getDate;
        table = 'BLOCK_PER_DAY';
    } else if (end - start > 3 * 24 * 60 * 60) {
        convertor =  getDateTime;  
        table = 'BLOCK_PER_1_HOUR';
    } else {
        convertor =  getTime;
        end = end - 900;
        table = 'BLOCK_PER_15_MINUTES';
    }


    console.log(type, end - start, table);
    
    if(type == 'price') {
        connection.query(`SELECT TIMESTAMP AS x, AVG_GAS_PRICE AS y FROM ${table} WHERE TIMESTAMP >= ${start} AND TIMESTAMP <= ${end} ORDER BY TIMESTAMP ASC;`, function (error, results, fields) {
            if (error) return res.send([]);

            for(let i = 0 ; i < results.length ; i ++) {
                results[i].x = convertor(new Date((results[i].x-0) * 1000));
                results[i].y = parseInt(results[i].y / 10000000);
                datas.xAxis.push(results[i].x);
            }

            for(let i = 0 ; i < results.length ; i ++) {
                if(results[i].y < datas.yAxis.min) {
                    datas.yAxis.min = results[i].y; 
                }
    
                if(results[i].y > datas.yAxis.max) {
                    datas.yAxis.max = results[i].y; 
                }
            }
    
            datas.pathInfos.push({
                class: 'avg',
                values: results
            });
    
            return res.send(datas);
        });
    } else if(type == 'tx') {
        connection.query(`SELECT TIMESTAMP AS x, TRANSACTION_COUNT AS y FROM ${table} WHERE TIMESTAMP >= ${start} AND TIMESTAMP <= ${end} ORDER BY TIMESTAMP ASC;`, function (error, results, fields) {
            if (error) return res.send([]);
    
            for(let i = 0 ; i < results.length ; i ++) {
                if(results[i].y < datas.yAxis.min) {
                    datas.yAxis.min = results[i].y; 
                }
    
                if(results[i].y > datas.yAxis.max) {
                    datas.yAxis.max = results[i].y; 
                }
            }

            for(let i = 0 ; i < results.length ; i ++) {
                results[i].x = convertor(new Date((results[i].x-0) * 1000));
                datas.xAxis.push(results[i].x);
            }
    
            datas.pathInfos.push({
                class: 'general',
                values: results
            });
    
            return res.send(datas);
        });
    } else {
        connection.query(`SELECT TIMESTAMP AS x FROM ${table} WHERE TIMESTAMP >= ${start} AND TIMESTAMP <= ${end} ORDER BY TIMESTAMP ASC;`, function (error, results, fields) {
            if (error) return res.send([]);
    
            for(let i = 0 ; i < results.length ; i ++) {
                if(i == 0 || results[i].x - results[i-1].x > 36) {
                    results[i].y = 14.372;
                } else {
                    results[i].y = results[i].x - results[i-1].x;
                }

                results[i].y = Math.floor(Math.random() * (36 - 1 + 1)) + 1;
    
                if(results[i].y < datas.yAxis.min) {
                    datas.yAxis.min = results[i].y; 
                }
    
                if(results[i].y > datas.yAxis.max) {
                    datas.yAxis.max = results[i].y; 
                }
            }

            for(let i = 0 ; i < results.length ; i ++) {
                results[i].x = convertor(new Date((results[i].x-0) * 1000));
                datas.xAxis.push(results[i].x);
            }
    
            datas.pathInfos.push({
                class: 'general',
                values: results
            });
    
            return res.send(datas);
        });
    }
});

router.get('/barChart/:type/:start/:end', (req, res) => {
    const type = req.params.type;
    const start = req.params.start;
    let end = req.params.end;
    const datas = {
        xAxis: [],
        yAxis: {
            min: Infinity,
            max: -1
        }
    };

    let convertor = null;
    let table = null;

    if (end - start > 7 * 24 * 60 * 60) {
        convertor =  getDate;
        table = 'BLOCK_PER_DAY';
    } else if (end - start > 3 * 24 * 60 * 60) {
        convertor =  getDateTime;  
        table = 'BLOCK_PER_1_HOUR';
    } else {
        convertor =  getTime;
        end = end - 900;
        table = 'BLOCK_PER_15_MINUTES';
    }

    console.log(type, end - start, table);

    if(type == 'price') {
        connection.query(`SELECT TIMESTAMP AS x, AVG_GAS_PRICE AS y FROM ${table} WHERE TIMESTAMP >= ${start} AND TIMESTAMP <= ${end} ORDER BY TIMESTAMP ASC;`, function (error, results, fields) {
            if (error) return res.send([]);

            for(let i = 0 ; i < results.length ; i ++) {
                results[i].x = convertor(new Date((results[i].x-0) * 1000));
                results[i].y = parseInt(results[i].y / 10000000);
                datas.xAxis.push(results[i].x);
            }

            for(let i = 0 ; i < results.length ; i ++) {
                if(results[i].y < datas.yAxis.min) {
                    datas.yAxis.min = results[i].y; 
                }
    
                if(results[i].y > datas.yAxis.max) {
                    datas.yAxis.max = results[i].y; 
                }
            }
    
            datas.values = results;
            datas.class = 'avg';
    
            return res.send(datas);
        });
    } else if(type == 'tx') {
        connection.query(`SELECT TIMESTAMP AS x, TRANSACTION_COUNT AS y FROM ${table} WHERE TIMESTAMP >= ${start} AND TIMESTAMP <= ${end} ORDER BY TIMESTAMP ASC;`, function (error, results, fields) {
            if (error) return res.send([]);
    
            for(let i = 0 ; i < results.length ; i ++) {
                if(results[i].y < datas.yAxis.min) {
                    datas.yAxis.min = results[i].y; 
                }
    
                if(results[i].y > datas.yAxis.max) {
                    datas.yAxis.max = results[i].y; 
                }
            }
    
            for(let i = 0 ; i < results.length ; i ++) {
                results[i].x = convertor(new Date((results[i].x-0) * 1000));
                datas.xAxis.push(results[i].x);
            }

            datas.values = results;
            datas.class = 'general';
    
            return res.send(datas);
        });
    } else {
        connection.query(`SELECT TIMESTAMP AS x FROM ${table} WHERE TIMESTAMP >= ${start} AND TIMESTAMP <= ${end} ORDER BY TIMESTAMP ASC;`, function (error, results, fields) {
            if (error) return res.send([]);
    
            for(let i = 0 ; i < results.length ; i ++) {
                if(i == 0 || results[i].x - results[i-1].x > 36) {
                    results[i].y = 14.372;
                } else {
                    results[i].y = results[i].x - results[i-1].x;
                }

                results[i].y = Math.floor(Math.random() * (36 - 1 + 1)) + 1;
    
                if(results[i].y < datas.yAxis.min) {
                    datas.yAxis.min = results[i].y; 
                }
    
                if(results[i].y > datas.yAxis.max) {
                    datas.yAxis.max = results[i].y; 
                }
            }

            for(let i = 0 ; i < results.length ; i ++) {
                results[i].x = convertor(new Date((results[i].x-0) * 1000));
                datas.xAxis.push(results[i].x);
            }
    
            datas.values = results;
            datas.class = 'general';
    
            return res.send(datas);
        });
    }
});


router.get('/pieChart/:start/:end', (req, res) => {
    const start = req.params.start;
    let end = req.params.end;
    connection.query(`SELECT A.MINER AS label, A.VALUE as value, B.COLOR as color FROM (SELECT MINER, COUNT(*) AS VALUE FROM BLOCK WHERE TIMESTAMP2 >=  ${start} AND TIMESTAMP2 <= ${end} GROUP BY MINER) AS A
    LEFT JOIN MINER_PER_BLOCK AS B
    ON A.MINER = B.MINER 
    ORDER BY A.VALUE DESC;`, function (error, results, fields) {
        if (error) {
            return res.send([]);
        };

        let index = 0;
        let ratio = 0;
        const result = []
        const sum = results.reduce( function(sum, item){
            return sum + item.value;
        }, 0);

        // console.log(sum);

        while(results[index].value / sum > 0.02) {
            results[index].value = parseInt(results[index].value / sum * 100) / 100;
            ratio += results[index].value;
            result.push(results[index]);
            // console.log(results[index].value);
            index++;
        }

        // console.log(100- ratio);
        result.push({
            label: 'Other',
            value: 1 - ratio,
            color: '#64dd42'
        });

        return res.send(result);
    });
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
