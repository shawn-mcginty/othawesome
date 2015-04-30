app.controller('othelloController', ['$scope', '$cookies', '$http', function($scope, $cookies, $http) {
	$scope.isGameOver = false;

	$scope.init = function(){
		$scope.isGameOver = false;
		$scope.gameUUID = $cookies.gameUUID;
		$scope.subscribeToGame(Othello);
		if($scope.gameUUID === undefined){
			$scope.gameUUID = createUUID();
			Othello.newGame($scope.gameUUID);
			Othello.startGame();
		} else {
			$http.get('/games/' + $scope.gameUUID)
				.success(function(data){
					if(data.game){
						Othello.loadGame(data.game);
					} else {
						Othello.newGame($scope.gameUUID);
					}
					Othello.startGame();
					$scope.syncWithCurrentGameState();
				})
				.error(function(){
					Othello.newGame($scope.gameUUID);
					Othello.startGame();
				});
		}
	}

	$scope.newGameHuman = function(){
		$scope.isGameOver = false;
		Othello.newGame($scope.gameUUID);
		Othello.startGame();
	}

	$scope.newGameCPU = function(){
		$scope.isGameOver = false;
		Othello.newGameWithCPU($scope.gameUUID);
		Othello.startGame();
	}

	$scope.makeMove = function(rowIndex, columnIndex){
		Othello.makeMove(rowIndex, columnIndex);
	}

	$scope.subscribeToGame = function(othello){
		var observableGame = othello.getObservableGame();
		observableGame.subscribe(
			function(next){
				if($scope.isGameOver == false){
					console.log('game event');
					$scope.syncWithCurrentGameState();
					$scope.saveGame();
				}
			},
			function(err){
				console.error(err);
			});
	}

	$scope.checkWinningConditions = function(othello){
		if(othello.hasNoAvailableMoves()){
			if(othello.isGameOver()){
				$scope.isGameOver = true;
				if(othello.isBlackPlayerWinning()){
					toast('Black player wins!', 8000);
				} else if(othello.isTie()){
					toast('Woah.. It\'s a tie.', 8000);
				} else{
					toast('White player wins!', 8000);
				}
			} else {
				if(othello.isBlackPlayersTurn()){
					toast('Black player\s turn skipped', 4000);
				} else {
					toast('White player\'s turn skipped', 4000);
				}

				othello.advanceTurn();
			}
		}
	}

	$scope.syncWithCurrentGameState = function(){
		$scope.gameBoard = Othello.getGameBoard();
		$scope.whitePlayer = Othello.getWhitePlayer();
		$scope.blackPlayer = Othello.getBlackPlayer();
		$scope.isBlackPlayersTurn = Othello.isBlackPlayersTurn();
		$scope.$apply();
		$scope.checkWinningConditions(Othello);
	}

	$scope.saveGame = function(){
		$http.post('/games', Othello.getGame())
			.success(function(){
				$cookies.gameUUID = $scope.gameUUID;
				console.log('game saved');
			})
			.error(function(){
				console.log('failed to save game');
			});
	}

	var createUUID = function() {
	    // http://www.ietf.org/rfc/rfc4122.txt
	    var s = [];
	    var hexDigits = "0123456789abcdef";
	    for (var i = 0; i < 36; i++) {
	        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	    }
	    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
	    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
	    s[8] = s[13] = s[18] = s[23] = "-";

	    var uuid = s.join("");
	    return uuid;
	}

	$scope.init();
}]);