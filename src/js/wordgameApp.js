'use strict';

// module for the game app. Bundling all controllers within this one module since it's a rather small application
angular.module('wordgameApp', ['ngRoute'])

  // controller for the actual game
  .controller('GameCtrl', function($scope, $interval, $http) {

    // define some constants
    var KEYCODE_BACKSPACE = 8;
    var KEYCODE_DELETE = 46;
    var TIME_PER_GAME = 40; // constant amount of seconds per game

    $scope.userName = ""; // holds the current user's name
    $scope.userNameEntered = false; // no user name set in the beginning
    $scope.gameScore = 0; // the user's total game score
    $scope.currentWordScore = 0; // the user's points for the currently displayed word
    $scope.remainingTime = TIME_PER_GAME; // remaining game time in seconds
    $scope.currentUnmangledWord = ""; // the word that we're currently looking for
    $scope.currentMangledWord = ""; // the mangled version of the word that we're currently looking for
    $scope.currentWordInput = ""; // the user's input
    $scope.wordsForGameRound = []; // the words to be used in the game round

    $scope.focusInput = false;

    /**
     * Starts the actual game.
     */
    $scope.startGame = function() {
        $scope.userNameEntered = true;

        // reset variables
        $scope.gameScore = 0;
        $scope.remainingTime = TIME_PER_GAME;

        // load list of words
        $scope.loadWordList();
    };

    /**
     * Loads a list of words for the game.
     */
    $scope.loadWordList = function() {
        // fetch list of words via REST call in form of JSON
        $http.get('./api.php/words').then(function(wordListResponse) {
            $scope.words = wordListResponse.data.words.records;
            $scope.mangleWords();
        }, function(error) {
            if (console) {
                console.error(error);
            }
        });
    };

    /**
     * Mangles the words by bringing the characters of the words into a random order. The words are also mixed up in
     * their ordering. The correct (unmangled) word and the mangled one are then put into an array of words for this
     * game round.
     */
    $scope.mangleWords = function() {
        $scope.wordsForGameRound = [];

        shuffle($scope.words);

        // iterate over each word and store the original and mangled version in an array of words for this game round
        angular.forEach($scope.words, function(value, key) {
            var wordEntry = {};
            wordEntry.original = value[1].toUpperCase(); // the actual word comes as second field from the server

            // create a mangled version of the word. Use up to 10 tries to make sure that the word is actually different
            for (var i = 0; i < 10; i++) {
                wordEntry.mangled = mangleWord(wordEntry.original);
                if (wordEntry.mangled !== wordEntry.original) {
                    break;
                }
            }
            $scope.wordsForGameRound.push(wordEntry);
        });

        // words are mangled now. Time to play!
        setupTimer();
        nextWord();
        // broadcast an event on which the word input text field will listen to put the focus into the text field
        // right from the start of the game
        // TODO mk: does not add the classes to the text input field yet which would make it show the 'glow' effect...
        $scope.$broadcast('gameStarted');
    };

    /**
     * Shuffles array in place.
     *
     * @param {Array} arr items The array containing the items.
     */
    function shuffle(arr) {
        var j, x, i;
        for (i = arr.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = arr[i - 1];
            arr[i - 1] = arr[j];
            arr[j] = x;
        }
    }

    /**
     * Takes the given word and mangles it by putting its characters into a random order.
     *
     * @param originalWord the original (unmangled) word
     * @return the mangled version of the given word
     */
    function mangleWord(originalWord) {
        var wordAsArray = originalWord.split("");
        shuffle(wordAsArray)
        return wordAsArray.join("");
    }

    /**
     * Loads the next word from the list, creates the mangled version of it and calculates the maximum amount of points
     * for it.
     */
    function nextWord() {
        // reset user input
        $scope.currentWordInput = "";

        // get next word from the list
        var nextWordEntry = $scope.wordsForGameRound.pop();
        $scope.currentUnmangledWord = nextWordEntry.original;
        $scope.currentMangledWord = nextWordEntry.mangled;

        // calculate the maximum score for this word
        $scope.currentWordScore = Math.floor(Math.pow(1.95, ($scope.currentUnmangledWord.length / 3)));
    }

    /**
     * Sets up a timer to count down the seconds of the game.
     */
    function setupTimer() {
        $interval(function() {
            // subtract one second from the remaining game time. Check if end has been reached.
            $scope.remainingTime = Math.max(0, --$scope.remainingTime);
            if ($scope.remainingTime === 0) {
                $scope.endGame();
            }
        }, 1000, TIME_PER_GAME);
    }

    /**
     * Checks the currently entered value and compares it to the word that we're looking for. If the entered text
     * matches then we calculate the points for the solution and add them to the total points. We then empty the text
     * input and show the next mangled word.
     * In case the word is wrong nothing is done and the user has to continue guessing.
     *
     * @param keyEvent the keyboard event
     */
    $scope.checkCurrentInput = function(keyEvent) {
        // deduct a point if delete key was pressed...
        if (keyEvent.which === KEYCODE_BACKSPACE || keyEvent.which === KEYCODE_DELETE) {
            $scope.currentWordScore = Math.max(0, --$scope.currentWordScore);
        } else if ($scope.currentWordInput.toUpperCase() === $scope.currentUnmangledWord.toUpperCase()) {
            // Bingo, correct word found! Calculate points and add to total score
            $scope.gameScore += $scope.currentWordScore;
            nextWord();
        }

        // in case the current score for this word is 0 we switch to the next one
        if ($scope.currentWordScore === 0) {
            nextWord();
        }
    };

    /**
     * Ends the game. The user's points will be stored on the server and the highscore list is shown afterwards.
     */
    $scope.endGame = function() {
        // send result to server to store it in the highscore list
        $http.post('./api.php/highscore', {
            "player": $scope.userName, // TODO mk: user name should probably be safely encoded prior to sending to database...
            "score": $scope.gameScore,
            "timestamp": new Date().addHours(1) // TODO mk: hack for now. Should actually send the date along with time zone information...
        }).then(function(success) {
            console.log(success);
        }, function(error) {
            if (console) {
                console.error(error);
            }
        });
    };
  })


  // add directive to listen on event to trigger a focus of the element
  .directive('focusOn', function() {
    return function(scope, elem, attr) {
        scope.$on(attr.focusOn, function(e) {
            elem[0].focus();
        });
     };
  })


  // controller for the highscore list
  .controller('HighscoreCtrl', function($scope, $http) {
      // load highscore entries from server via REST call
      $http.get('./api.php/highscore').then(function(highscoreResponse) {
        $scope.entries = orderHighscoreEntries(normalizeHighscoreEntries(highscoreResponse.data.highscore.records));
      }, function(error) {
        if (console) {
            console.error(error);
        }
      });

      /**
       * Little helper function that transforms the data that is being retrieved from the server into proper JSON format.
       */
      function normalizeHighscoreEntries(retrievedEntries) {
        // retrieved columns are ["id","player","score","timestamp"]
        var ret = [];
        angular.forEach(retrievedEntries, function(value, key){
            ret.push({
                "player": value[1],
                "score": value[2],
                "timestamp": new Date(Date.parse(value[3]))
            });
        });
        return ret;
      }

      /**
       * Returns the given highscore list ordered by score descending, name ascending.
       *
       * @param unorderedEntries the unordered highscore list
       */
      function orderHighscoreEntries(unorderedEntries) {
          var orderedEntries = unorderedEntries;
          orderedEntries = orderedEntries.sort(function(a, b) {
              // order the highscore entries by points descending, name ascending
              if (a.score !== b.score) {
                  // scores are different so order by score only (descending)
                  return b.score - a.score;
              }
              // same score. Order by name ascending
              if (a.player < b.player) {
                  return -1;
              } else if (a.player > b.player) {
                  return 1;
              }
              // basically the same entry
              return 0;
          });
          return orderedEntries;
      };
  })


  // configure the different pages via Angular routes
  .config(function($routeProvider) {
    $routeProvider
      .when('/', { templateUrl: 'howto.html' })
      .when('/start', { templateUrl: 'game.html' })
      .when('/highscore', { templateUrl: 'highscore.html' })
      .otherwise({ redirectTo: '/' });
});
