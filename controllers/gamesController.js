var express = require('express');
var Game = require('../models/game');
var router = express.Router();

router.post('/', function(req, res, next){
	var game = new Game(req.body);

	Game.findByIdAndUpdate(game._id, { whitePlayerDiscs: game.whitePlayerDiscs,
		blackPlayerDiscs: game.blackPlayerDiscs,
		whitePlayerPoints: game.whitePlayerPoints,
		blackPlayerPoints: game.blackPlayerPoints,
		gameBoard: game.gameBoard,
		isBlackPlayersTurn: game.isBlackPlayersTurn,
		isCPU: game.isCPU }, 
		{upsert: true}, 
		function(err, data){
			if(err){
				console.log(err);
				next(err);
			} else {
				res.json({game: data});
			}
		}
	);
});

router.get('/:game_id', function(req, res, next){
	Game.findById(req.params.game_id, function(err, game){
		if(!err){
			res.json({game: game});
			next(err);
		} else {
			console.error(err);
		}
	});

});

module.exports = router;