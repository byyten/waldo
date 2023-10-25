var express = require('express');
var router = express.Router();

// const mongodb = require("mongodb")

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PlayerScore = new Schema({
  name: { type: String, required: true },
  score: { type: Number, required: true },
  time: { type: Number, required: true }
});


const playerscore = mongoose.model("playerScore", PlayerScore)

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/register_score", async (req, res) => {
  /* 
  req = { body: { name: "p1", time: 23.456, score: 78.34 }}
  */
  if (req.time < 180) {
    let score = new playerscore( req.body )
    resp = await score.save()
    res.json(resp)
    } else {
      res.json({ op: "register_score", status: 403, result: "registered time is not good enough to make leaderboard"})
    }
})


router.get("/leaderboard", async (req, res) => {
  try {
    let scores = await playerscore.find({})
    res.json((scores.sort((a, b) => { return a.time - b.time })).slice(0, 5))
  } catch (err ) {
    console.log(err)
    res.json({ err: err, status: 500 })
  }
})
module.exports = router;
