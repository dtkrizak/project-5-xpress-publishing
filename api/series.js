const express = require('express');
const seriesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const issuesRouter = require('./issues');

seriesRouter.use('/:seriesId/issues', issuesRouter);


seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    db.get(`SELECT * FROM Series WHERE id = ${seriesId}`, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            req.series = row;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

seriesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Series`, (err, series) => {
        if(err){
            next(err);
        } else {
            res.status(200).json({series: series});
        }
    });
});

seriesRouter.get('/:seriesId', (req, res, next) => {
    res.status(200).json({series: req.series});
})

seriesRouter.post('/', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;

    if(!name || !description) {
        return res.sendStatus(400);
    }

    db.run(`INSERT INTO Series (
        name, description) VALUES ($name, $description
    )`, {
        $name: name,
        $description: description
    }, function (err) {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`, (err, row) => {
                res.status(201).json({series: row});
            })
        }
    });
});

seriesRouter.put('/:seriesId', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;

    if (!name || !description) {
        return res.sendStatus(400);
    }

    db.run(`UPDATE Series 
        SET name = $name, description = $description
        WHERE id = $id`, {
        $id: req.params.seriesId,
        $name: name,
        $description: description
    }, function (err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Series WHERE id = ${req.params.seriesId}`, (err, row) => {
                if(err){
                    next(err);
                } else {
                    res.status(200).json({ series: row });
                }
            })
        }
    });
});

seriesRouter.delete('/:seriesId', (req, res, next) => {
    db.all(`SELECT * FROM Issue WHERE series_id = $series_id`, { $series_id: req.params.seriesId }, (err, rows) => {
        if (err) {
            next(err);
        } else if (rows) {
            res.sendStatus(400);
            //Sends response if issues exist for the series
        } else {
            db.run(`DELETE FROM Series WHERE Series.id=$id`, { $id: req.params.seriesId }, (err) => {
                if(err){
                    next(err);
                }else{
                    res.sendStatus(204);
                }
            });
        }
    });
});

module.exports = seriesRouter;