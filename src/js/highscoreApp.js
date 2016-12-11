angular.module('highscoreApp', [])
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
  });
