var mongoose = require('mongoose');

var gameSchema = mongoose.Schema({
	_id: String,
	whitePlayerDiscs: Number,
	blackPlayerDiscs: Number,
	whitePlayerPoints: Number,
	blackPlayerPoints: Number,
	gameBoard: Array,
	isBlackPlayersTurn: Boolean,
	isCPU: Boolean
});

var Game = mongoose.model('Game', gameSchema);

module.exports = Game;