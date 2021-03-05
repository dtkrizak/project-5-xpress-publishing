const express = require('express');
const issuesRouter = express.Router({mergeParams: true});  //merges to enable seeing seriesId param
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.param('issueId', (req, res, next, issueId) => {
    db.get(`SELECT * FROM Issue WHERE id = ${issueId}`, (err, row) =>{
        if (err) {
            next(err);
        } else if (row){
            req.issue = row;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

issuesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Issue WHERE series_id = ${req.params.seriesId}`, (err, rows) => {
        if(err){ 
            next(err);
        } else {
            res.status(200).json({issues: rows});
        }
    });
});

issuesRouter.post('/', (req, res, next) => {
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;

    db.get(`SELECT * FROM Artist WHERE id = ${artistId}`, (err, row) => {
        if(err) {
            next(err);
        } else if (!row || !name || !issueNumber || !publicationDate) {
            return res.sendStatus(400);
        } else {
            const sql = `INSERT INTO Issue (
                name, issue_number, publication_date, artist_id, series_id) VALUES ( 
                $name, $issue_number, $publication_date, $artist_id, $series_id
                )`;

            db.run(sql, {
                    $name: name,
                    $issue_number: issueNumber,
                    $publication_date: publicationDate,
                    $artist_id: artistId,
                    $series_id: req.params.seriesId
                }, function (err) {
                    if(err){
                        next(err);
                    } else {
                        db.get(`SELECT * FROM Issue WHERE id = ${this.lastID}`, (err, row) => {
                            res.status(201).json({issue: row});
                        });
                    }
                }
            );
        }
    });
    

});

issuesRouter.put('/:issueId', (req, res, next) => {
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;

    if (!name || !issueNumber || !publicationDate || !artistId) {
        return res.sendStatus(400);
    }

    db.run(`UPDATE Issue
        SET name = $name, issue_number = $issue_number, publication_date = $publication_date, artist_id = $artist_id
        WHERE id = $id
        `, {
        $name: name,
        $issue_number: issueNumber,
        $publication_date: publicationDate,
        $artist_id: artistId,
        $id: req.params.issueId
    }, function (err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Issue WHERE id = ${req.params.issueId}`, (err, row) => {
                res.status(200).json({ issue: row });
            });
        }
    }
    );
})

issuesRouter.delete('/:issueId', (req, res, next) => {
    db.run(`DELETE FROM Issue WHERE id = ${req.params.issueId}`, function(err){
        if(err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    });
});

module.exports = issuesRouter;