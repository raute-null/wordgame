// module for the game app. Bundling all controllers within this one module since it's a rather small application
angular.module('wordgameApp', ['ngRoute'])

  // general controller for the 'how to play the game' page
  .controller('MainCtrl', function($scope) {
    // TODO mk: is this controller needed at all? The dummy one could be sufficient in this case...
  })


  // controller for the actual game
  .controller('GameCtrl', function($scope, $interval) {

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
    $scope.timer = null; // the timer to count down the game time

    /**
     * Starts the actual game.
     */
    $scope.startGame = function() {
        console.log("Game started!"); // TODO mk
        console.log("Welcome user " + $scope.userName); // TODO mk

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
        console.log("Loading words..."); // TODO mk

        // TODO mk: words need to be fetched via REST call
        // TODO mk: make sure that there are quite a few words in the DB so that
        //          a) the user won't be able to see all of them within one round of playing
        //          b) the user won't know all of them after only a few rounds of playing

        // TODO mk: hard-coded for now...
        $scope.words = [
            { id: 1,  word: "pizza" },
            { id: 2,  word: "pasta" },
            { id: 3,  word: "auto" },
            { id: 4,  word: "universe" },
            { id: 5,  word: "application" },
            { id: 6,  word: "phone" },
            { id: 7,  word: "garden" },
            { id: 8,  word: "hospital" },
            { id: 9,  word: "sofa" },
            { id: 10, word: "computer" },
            { id: 11, word: "program" },
            { id: 12, word: "earth" },
            { id: 13, word: "potato" }
          ];

        $scope.mangleWords();
    };

    /**
     * Mangles the words by bringing the characters of the words into a random order. The words are also mixed up in
     * their ordering. The correct (unmangled) word and the mangled one are then put into an array of words for this
     * game round.
     */
    $scope.mangleWords = function() {
        console.log("Mangling words..."); // TODO mk

        $scope.wordsForGameRound = [];

        shuffle($scope.words);

        // iterate over each word and store the original and mangled version in an array of words for this game round
        angular.forEach($scope.words, function(value, key) {
            var wordEntry = {};
            wordEntry.original = value.word.toUpperCase();

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
    };

    /**
     * Shuffles array in place.
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

        console.log("The next word that we're looking for is: " + $scope.currentUnmangledWord); // TODO mk
        console.log("Mangled into: " + $scope.currentMangledWord); // TODO mk

        // calculate the maximum score for this word
        $scope.currentWordScore = Math.floor(Math.pow(1.95, ($scope.currentUnmangledWord.length / 3)));

        console.log("The maximum score for this word is: " + $scope.currentWordScore); // TODO mk
    }

    /**
     * Sets up a timer to count down the seconds of the game.
     */
    function setupTimer() {
        $scope.timer = $interval(function() {
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

        console.log("Will now check if " + $scope.currentWordInput + " is what we're looking for ("
            + $scope.currentUnmangledWord + ")..."); // TODO mk

        // deduct a point if delete key was pressed...
        if (keyEvent.which === KEYCODE_BACKSPACE || keyEvent.which === KEYCODE_DELETE) {
            $scope.currentWordScore = Math.max(0, --$scope.currentWordScore);

            console.log("The current score for the word is " + $scope.currentWordScore);

        } else if ($scope.currentWordInput.toUpperCase() === $scope.currentUnmangledWord.toUpperCase()) {
            // Bingo, correct word found! Calculate points and add to total score
            $scope.gameScore += $scope.currentWordScore;

            console.log("Word found! Points added: " + $scope.currentWordScore + ". Going to next one."); // TODO mk

            nextWord();
        }

        // TODO mk: in case the current score for this word is 0 we could switch to the next one...

    };

    /**
     * Ends the game. The user's points will be stored on the server and the highscore list is shown afterwards.
     */
    $scope.endGame = function() {

        // TODO mk: send result to server via REST
        console.log("Game has ended. Reached score: " + $scope.gameScore); // TODO mk

        // forward to highscore list
        // TODO mk (if possible, also highlight the current result)

    };


    // TODO mk
  })


  // controller for the highscore list
  .controller('HighscoreCtrl', function($scope) {
      // define highscore entries statically for now. Will later be loaded via REST
      // TODO mk: load via REST...
      $scope.entries = [
        { id: 1,  name: "Manuel Schwarz",       points: 22 },
        { id: 2,  name: "Max Müller",           points: 21 },
        { id: 3,  name: "Frank Budenholzer",    points: 14 },
        { id: 4,  name: "Bernd Stromberg",      points: 8 },
        { id: 5,  name: "Berthold Heisterkamp", points: 8 },
        { id: 6,  name: "Erika Bellstedt",      points: 8 },
        { id: 7,  name: "Michael Scott",        points: 11 },
        { id: 8,  name: "Fridolin Meyer",       points: 9 },
        { id: 9,  name: "Hugo Hermelin",        points: 20 },
        { id: 10, name: "Gundula Gause",        points: 12 },
        { id: 11, name: "Pete Glocke",          points: 7 },
        { id: 12, name: "Lars Tromeke",         points: 6 },
        { id: 13, name: "Paulo Maldini",        points: 1 }
      ];

      /**
       * Returns the current highscore list ordered by score descending, name ascending.
       */
      $scope.getOrderedEntries = function() {
          var self = this;

          // TODO mk: check if entries are already loaded. Load them if they aren't, yet.

          var orderedEntries = self.entries;
          orderedEntries = orderedEntries.sort(function(a, b) {
              // order the highscore entries by points descending, name ascending
              if (a.points !== b.points) {
                  // scores are different so order by score only (descending)
                  return b.points - a.points;
              }
              // same score. Order by name ascending
              if (a.name < b.name) {
                  return -1;
              } else if (a.name > b.name) {
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
