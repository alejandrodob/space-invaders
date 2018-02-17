// Generated by BUCKLESCRIPT VERSION 2.1.0, PLEASE EDIT WITH CARE
'use strict';

var List  = require("bs-platform/lib/js/list.js");
var Block = require("bs-platform/lib/js/block.js");

var canvas = document.getElementById("screen");

var screen = canvas.getContext("2d");

function getScreenSize(context) {
  return /* record */[
          /* width */context.width,
          /* height */context.height
        ];
}

function updateBody(keyboard, body) {
  switch (body.tag | 0) {
    case 0 : 
        var position = body[1];
        var match = keyboard[/* left */0];
        var match$1 = keyboard[/* right */1];
        return /* Player */Block.__(0, [
                  body[0],
                  /* record */[
                    /* x */(position[/* x */0] + (
                        match !== 0 ? -2 : 0
                      ) | 0) + (
                      match$1 !== 0 ? 2 : 0
                    ) | 0,
                    /* y */position[/* y */1]
                  ]
                ]);
    case 1 : 
        var velocity = body[2];
        var position$1 = body[1];
        return /* Invader */Block.__(1, [
                  body[0],
                  /* record */[
                    /* x */position$1[/* x */0] + velocity[/* x */0] | 0,
                    /* y */position$1[/* y */1] + velocity[/* y */1] | 0
                  ],
                  velocity
                ]);
    case 2 : 
        var velocity$1 = body[2];
        var position$2 = body[1];
        return /* Bullet */Block.__(2, [
                  body[0],
                  /* record */[
                    /* x */position$2[/* x */0] + velocity$1[/* x */0] | 0,
                    /* y */position$2[/* y */1] + velocity$1[/* y */1] | 0
                  ],
                  velocity$1
                ]);
    
  }
}

function isPlayer(body) {
  switch (body.tag | 0) {
    case 0 : 
        return /* true */1;
    case 1 : 
    case 2 : 
        return /* false */0;
    
  }
}

function isInvader(body) {
  switch (body.tag | 0) {
    case 1 : 
        return /* true */1;
    case 0 : 
    case 2 : 
        return /* false */0;
    
  }
}

function findPlayer(bodies) {
  return List.find(isPlayer, bodies);
}

function findInvaders(bodies) {
  return List.find_all(isInvader)(bodies);
}

function getPosition(body) {
  return body[1];
}

function getSize(body) {
  return body[0];
}

function colliding(body1, body2) {
  var size1 = getSize(body1);
  var size2 = getSize(body2);
  var position1 = getPosition(body1);
  var position2 = getPosition(body2);
  return 1 - +(body1 === body2 || (position1[/* x */0] + (size1[/* width */0] / 2 | 0) | 0) < (position2[/* x */0] - (size2[/* width */0] / 2 | 0) | 0) || (position1[/* y */1] + (size1[/* height */1] / 2 | 0) | 0) < (position2[/* y */1] - (size2[/* height */1] / 2 | 0) | 0) || (position1[/* x */0] - (size1[/* width */0] / 2 | 0) | 0) > (position2[/* x */0] + (size2[/* width */0] / 2 | 0) | 0) || (position1[/* y */1] - (size1[/* height */1] / 2 | 0) | 0) > (position2[/* y */1] + (size2[/* height */1] / 2 | 0) | 0));
}

function notCollidingWithAny(bodies, body) {
  return +(List.length(List.filter((function (b) {
                        return colliding(b, body);
                      }))(bodies)) === 0);
}

function invaderShot(invader) {
  var invaderPosition = getPosition(invader);
  var invaderSize = getSize(invader);
  if (Math.random() > 0.995) {
    return /* :: */[
            /* Bullet */Block.__(2, [
                /* record */[
                  /* width */3,
                  /* height */3
                ],
                /* record */[
                  /* x */invaderPosition[/* x */0],
                  /* y */invaderPosition[/* y */1] + (invaderSize[/* height */1] / 2 | 0) | 0
                ],
                /* record */[
                  /* x */0,
                  /* y */2
                ]
              ]),
            /* [] */0
          ];
  } else {
    return /* [] */0;
  }
}

function tick(game, keyboard) {
  var player = List.find(isPlayer, game[/* bodies */0]);
  var playerPosition = getPosition(player);
  var invaders = List.find_all(isInvader)(game[/* bodies */0]);
  var partial_arg = game[/* bodies */0];
  var survivingBodies = List.filter((function (param) {
            return notCollidingWithAny(partial_arg, param);
          }))(game[/* bodies */0]);
  var playerBullets = keyboard[/* space */2] ? /* :: */[
      /* Bullet */Block.__(2, [
          /* record */[
            /* width */3,
            /* height */3
          ],
          playerPosition,
          /* record */[
            /* x */0,
            /* y */-6
          ]
        ]),
      /* [] */0
    ] : /* [] */0;
  var invaderBullets = List.flatten(List.map(invaderShot, invaders));
  var newBullets = List.append(playerBullets, invaderBullets);
  var allBodies = List.append(survivingBodies, newBullets);
  return /* record */[/* bodies */List.map((function (param) {
                  return updateBody(keyboard, param);
                }), allBodies)];
}

function drawToScreen(screen, size, position) {
  screen.fillRect(position[/* x */0] - (size[/* width */0] / 2 | 0) | 0, position[/* y */1] - (size[/* height */1] / 2 | 0) | 0, size[/* width */0], size[/* height */1]);
  return /* () */0;
}

function drawBody(screen, body) {
  return drawToScreen(screen, body[0], body[1]);
}

function draw(game, canvas) {
  var screen = canvas.getContext("2d");
  var screenSize = getScreenSize(canvas);
  screen.clearRect(0, 0, screenSize[/* width */0], screenSize[/* height */1]);
  return List.map((function (param) {
                return drawBody(screen, param);
              }), game[/* bodies */0]);
}

var initialState = /* record */[/* bodies : :: */[
    /* Player */Block.__(0, [
        /* record */[
          /* width */18,
          /* height */8
        ],
        /* record */[
          /* x */120,
          /* y */300
        ]
      ]),
    /* :: */[
      /* Invader */Block.__(1, [
          /* record */[
            /* width */30,
            /* height */10
          ],
          /* record */[
            /* x */10,
            /* y */20
          ],
          /* record */[
            /* x */0,
            /* y */0
          ]
        ]),
      /* :: */[
        /* Invader */Block.__(1, [
            /* record */[
              /* width */30,
              /* height */10
            ],
            /* record */[
              /* x */45,
              /* y */20
            ],
            /* record */[
              /* x */0,
              /* y */0
            ]
          ]),
        /* :: */[
          /* Invader */Block.__(1, [
              /* record */[
                /* width */30,
                /* height */10
              ],
              /* record */[
                /* x */80,
                /* y */20
              ],
              /* record */[
                /* x */0,
                /* y */0
              ]
            ]),
          /* :: */[
            /* Invader */Block.__(1, [
                /* record */[
                  /* width */30,
                  /* height */10
                ],
                /* record */[
                  /* x */115,
                  /* y */20
                ],
                /* record */[
                  /* x */0,
                  /* y */0
                ]
              ]),
            /* :: */[
              /* Invader */Block.__(1, [
                  /* record */[
                    /* width */30,
                    /* height */10
                  ],
                  /* record */[
                    /* x */150,
                    /* y */20
                  ],
                  /* record */[
                    /* x */0,
                    /* y */0
                  ]
                ]),
              /* :: */[
                /* Invader */Block.__(1, [
                    /* record */[
                      /* width */30,
                      /* height */10
                    ],
                    /* record */[
                      /* x */185,
                      /* y */20
                    ],
                    /* record */[
                      /* x */0,
                      /* y */0
                    ]
                  ]),
                /* :: */[
                  /* Invader */Block.__(1, [
                      /* record */[
                        /* width */30,
                        /* height */10
                      ],
                      /* record */[
                        /* x */220,
                        /* y */20
                      ],
                      /* record */[
                        /* x */0,
                        /* y */0
                      ]
                    ]),
                  /* :: */[
                    /* Invader */Block.__(1, [
                        /* record */[
                          /* width */30,
                          /* height */10
                        ],
                        /* record */[
                          /* x */255,
                          /* y */20
                        ],
                        /* record */[
                          /* x */0,
                          /* y */0
                        ]
                      ]),
                    /* :: */[
                      /* Invader */Block.__(1, [
                          /* record */[
                            /* width */30,
                            /* height */10
                          ],
                          /* record */[
                            /* x */290,
                            /* y */20
                          ],
                          /* record */[
                            /* x */0,
                            /* y */0
                          ]
                        ]),
                      /* [] */0
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      ]
    ]
  ]];

var gameKeyboard = /* record */[
  /* left : false */0,
  /* right : false */0,
  /* space : false */0
];

document.addEventListener("keydown", (function (e) {
        var keyCode = e.keyCode;
        var switcher = keyCode - 32 | 0;
        if (switcher > 7 || switcher < 0) {
          return /* () */0;
        } else {
          switch (switcher) {
            case 0 : 
                gameKeyboard[/* space */2] = /* true */1;
                return /* () */0;
            case 5 : 
                gameKeyboard[/* left */0] = /* true */1;
                return /* () */0;
            case 1 : 
            case 2 : 
            case 3 : 
            case 4 : 
            case 6 : 
                return /* () */0;
            case 7 : 
                gameKeyboard[/* right */1] = /* true */1;
                return /* () */0;
            
          }
        }
      }));

document.addEventListener("keyup", (function (e) {
        var keyCode = e.keyCode;
        var switcher = keyCode - 32 | 0;
        if (switcher > 7 || switcher < 0) {
          return /* () */0;
        } else {
          switch (switcher) {
            case 0 : 
                gameKeyboard[/* space */2] = /* false */0;
                return /* () */0;
            case 5 : 
                gameKeyboard[/* left */0] = /* false */0;
                return /* () */0;
            case 1 : 
            case 2 : 
            case 3 : 
            case 4 : 
            case 6 : 
                return /* () */0;
            case 7 : 
                gameKeyboard[/* right */1] = /* false */0;
                return /* () */0;
            
          }
        }
      }));

function gameLoop(state, keyboard, _) {
  var nextState = tick(state, keyboard);
  draw(nextState, canvas);
  return requestAnimationFrame((function (param) {
                return gameLoop(nextState, keyboard, param);
              }));
}

gameLoop(initialState, gameKeyboard, 0);

exports.canvas              = canvas;
exports.screen              = screen;
exports.getScreenSize       = getScreenSize;
exports.updateBody          = updateBody;
exports.isPlayer            = isPlayer;
exports.isInvader           = isInvader;
exports.findPlayer          = findPlayer;
exports.findInvaders        = findInvaders;
exports.getPosition         = getPosition;
exports.getSize             = getSize;
exports.colliding           = colliding;
exports.notCollidingWithAny = notCollidingWithAny;
exports.invaderShot         = invaderShot;
exports.tick                = tick;
exports.drawToScreen        = drawToScreen;
exports.drawBody            = drawBody;
exports.draw                = draw;
exports.initialState        = initialState;
exports.gameKeyboard        = gameKeyboard;
exports.gameLoop            = gameLoop;
/* canvas Not a pure module */
