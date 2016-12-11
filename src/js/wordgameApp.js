var TIME_PER_GAME = 40; // constant amount of seconds per game

// module for the game app. Bundling all controllers within this one module since it's a rather small application
angular.module('wordgameApp', ['ngRoute'])
  // general controller for the 'how to play the game' page
  .controller('MainCtrl', function($scope) {
    // TODO mk
  })

  // controller for the actual game
  .controller('GameCtrl', function($scope) {

    $scope.userName = ""; // holds the current user's name
    $scope.userNameEntered = false; // no user name set in the beginning
    $scope.gameScore = 0; // the user's total game score
    $scope.currentWordScore = 0; // the user's points for the currently displayed word
    $scope.remainingTime = TIME_PER_GAME; // remaining game time in seconds

    /**
     * Starts the actual game.
     */
    $scope.startGame = function() {

        console.log("Game started!"); // TODO mk
        console.log("Welcome user " + $scope.userName);

        $scope.userNameEntered = true;

        // reset variables
        $scope.gameScore = 0;
        $scope.currentWordScore = 0;
        $scope.remainingTime = TIME_PER_GAME;

        // TODO mk: load the list of words, mingle them and then start a timer and show word after word



    }


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
