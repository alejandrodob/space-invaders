type element;

type context;

type event;

type window;

[@bs.get] external elementWidth : element => int = "width";

[@bs.get] external elementHeight : element => int = "height";

[@bs.val]
external getElementById : string => element = "document.getElementById";

[@bs.val] external document : element = "document";

[@bs.send]
external getContext2d : (element, [@bs.as "2d"] _) => context = "getContext";

[@bs.send]
external fillRect : (context, int, int, int, int) => unit = "fillRect";

[@bs.send]
external clearRect : (context, int, int, int, int) => unit = "clearRect";

[@bs.val]
external requestAnimationFrame : (int => int) => int = "requestAnimationFrame";

[@bs.val] external cancelAnimationFrame : int => unit = "cancelAnimationFrame";

[@bs.send]
external addEventListener : (element, string, event => unit) => unit =
  "addEventListener";

[@bs.get] external getKeyCode : event => int = "keyCode";

type size = {
  width: int,
  height: int
};

type position = {
  x: int,
  y: int
};

type velocity = {
  x: int,
  y: int
};

type body =
  | Player(size, position)
  | Invader(size, position, velocity)
  | Bullet(size, position, velocity);

type keyboard = {
  mutable left: bool,
  mutable right: bool,
  mutable space: bool
};

type gameBoard = {
  bodies: list(body),
  size
};

let getScreenSize = context => {
  width: elementWidth(context),
  height: elementHeight(context)
};

let isPlayer = body =>
  switch body {
  | Player(_, _) => true
  | _ => false
  };

let isInvader = body =>
  switch body {
  | Invader(_, _, _) => true
  | _ => false
  };

let findPlayer = bodies => List.find(isPlayer, bodies);

let findInvaders = bodies => List.find_all(isInvader, bodies);

let getPosition = body =>
  switch body {
  | Player(_, position) => position
  | Invader(_, position, _) => position
  | Bullet(_, position, _) => position
  };

let getSize = body =>
  switch body {
  | Player(size, _) => size
  | Invader(size, _, _) => size
  | Bullet(size, _, _) => size
  };

let colliding = (body1, body2) => {
  let size1 = getSize(body1);
  let size2 = getSize(body2);
  let position1 = getPosition(body1);
  let position2 = getPosition(body2);
  ! (
    body1 === body2
    || position1.x
    + size1.width
    / 2 < position2.x
    - size2.width
    / 2
    || position1.y
    + size1.height
    / 2 < position2.y
    - size2.height
    / 2
    || position1.x
    - size1.width
    / 2 > position2.x
    + size2.width
    / 2
    || position1.y
    - size1.height
    / 2 > position2.y
    + size2.height
    / 2
  );
};

let notCollidingWithAny = (bodies, body) =>
  List.length(List.filter(b => colliding(b, body), bodies)) == 0;

let invaderShot = invader => {
  let invaderPosition = getPosition(invader);
  let invaderSize = getSize(invader);
  if (Js.Math.random() > 0.995) {
    [
      Bullet(
        {width: 3, height: 3},
        {x: invaderPosition.x, y: invaderPosition.y + invaderSize.height / 2},
        {x: 0, y: 2}
      )
    ];
  } else {
    [];
  };
};

let insideGameBoard = (boardSize, body) => {
  let bodyPosition = getPosition(body);
  let bodySize = getSize(body);
  boardSize.width > bodyPosition.x
  + bodySize.width
  / 2
  && bodyPosition.x
  - bodySize.width
  / 2 > 0
  && boardSize.height > bodyPosition.y
  + bodySize.height
  / 2
  && bodyPosition.y
  - bodySize.height
  / 2 > 0;
};

let inRightBoardEdge = (boardSize, body) => {
  let bodyPosition = getPosition(body);
  let bodySize = getSize(body);
  boardSize.width == bodyPosition.x
  + bodySize.width
  / 2
  || boardSize.width
  + 1 == bodyPosition.x
  + bodySize.width
  / 2;
};

let inLeftBoardEdge = (boardSize, body) => {
  let bodyPosition = getPosition(body);
  let bodySize = getSize(body);
  bodyPosition.x
  - bodySize.width
  / 2 == 0
  || bodyPosition.x
  - bodySize.width
  / 2 == (-1);
};

let updateBody = (keyboard, boardSize, body) =>
  switch body {
  | Player(size, position) when insideGameBoard(boardSize, body) =>
    Player(
      size,
      {
        x: position.x + (keyboard.left ? (-2) : 0) + (keyboard.right ? 2 : 0),
        y: position.y
      }
    )
  | Player(size, position) when inRightBoardEdge(boardSize, body) =>
    Player(size, {x: position.x + (keyboard.left ? (-2) : 0), y: position.y})
  | Player(size, position) when inLeftBoardEdge(boardSize, body) =>
    Player(size, {x: position.x + (keyboard.right ? 2 : 0), y: position.y})
  | Player(_, _) => body
  | Invader(size, position, velocity) =>
    Invader(
      size,
      {x: position.x + velocity.x, y: position.y + velocity.y},
      velocity
    )
  | Bullet(size, position, velocity) =>
    Bullet(
      size,
      {x: position.x + velocity.x, y: position.y + velocity.y},
      velocity
    )
  };

let notBulletAndInsideGameBoard = (boardSize, body) => {
  let bodyPosition = getPosition(body);
  isPlayer(body)
  || isInvader(body)
  || boardSize.width >= bodyPosition.x
  && insideGameBoard(boardSize, body);
};

let tick = (game, keyboard) => {
  let player = findPlayer(game.bodies);
  let playerPosition = getPosition(player);
  let invaders = findInvaders(game.bodies);
  let survivingBodies =
    game.bodies
    |> List.filter(notCollidingWithAny(game.bodies))
    |> List.filter(notBulletAndInsideGameBoard(game.size));
  let playerBullets =
    if (keyboard.space) {
      [Bullet({width: 3, height: 3}, playerPosition, {x: 0, y: (-6)})];
    } else {
      [];
    };
  let invaderBullets = List.flatten(List.map(invaderShot, invaders));
  let newBullets = List.append(playerBullets, invaderBullets);
  let allBodies = List.append(survivingBodies, newBullets);
  {
    bodies: List.map(updateBody(keyboard, game.size), allBodies),
    size: game.size
  };
};

let drawToScreen = (screen, size, position: position) =>
  fillRect(
    screen,
    position.x - size.width / 2,
    position.y - size.height / 2,
    size.width,
    size.height
  );

let drawBody = (screen, body) =>
  switch body {
  | Player(size, position) => drawToScreen(screen, size, position)
  | Invader(size, position, _) => drawToScreen(screen, size, position)
  | Bullet(size, position, _) => drawToScreen(screen, size, position)
  };

let draw = (game, canvas) => {
  let screen = getContext2d(canvas);
  let screenSize = getScreenSize(canvas);
  clearRect(screen, 0, 0, screenSize.width, screenSize.height);
  List.map(drawBody(screen), game.bodies);
};

let makeGameBoard = canvas => {
  let {width, height} = getScreenSize(canvas);
  let playerSize = {width: 18, height: 8};
  let playerPosition: position = {x: width / 2, y: height - 10};
  let invaderSize = {width: width / 10, height: height / 30};
  let invaderSpeed = {x: 0, y: 0};
  let invaderXOffset = invaderSize.width / 2 + invaderSize.width / 10;
  let invaderXSeparation = invaderSize.width + invaderSize.width / 10;
  {
    bodies: [
      Player(playerSize, playerPosition),
      Invader(
        invaderSize,
        {x: invaderXOffset + invaderXSeparation * 0, y: 10},
        invaderSpeed
      ),
      Invader(
        invaderSize,
        {x: invaderXOffset + invaderXSeparation * 1, y: 10},
        invaderSpeed
      ),
      Invader(
        invaderSize,
        {x: invaderXOffset + invaderXSeparation * 2, y: 10},
        invaderSpeed
      ),
      Invader(
        invaderSize,
        {x: invaderXOffset + invaderXSeparation * 3, y: 10},
        invaderSpeed
      ),
      Invader(
        invaderSize,
        {x: invaderXOffset + invaderXSeparation * 4, y: 10},
        invaderSpeed
      ),
      Invader(
        invaderSize,
        {x: invaderXOffset + invaderXSeparation * 5, y: 10},
        invaderSpeed
      ),
      Invader(
        invaderSize,
        {x: invaderXOffset + invaderXSeparation * 6, y: 10},
        invaderSpeed
      ),
      Invader(
        invaderSize,
        {x: invaderXOffset + invaderXSeparation * 7, y: 10},
        invaderSpeed
      ),
      Invader(
        invaderSize,
        {x: invaderXOffset + invaderXSeparation * 8, y: 10},
        invaderSpeed
      )
    ],
    size: {
      width,
      height
    }
  };
};

let gameKeyboard = {left: false, right: false, space: false};

type key =
  | Left
  | Right
  | Space
  | UnusedKey;

let keyFromEvent = e => {
  let keyCode = getKeyCode(e);
  switch keyCode {
  | 37 => Left
  | 39 => Right
  | 32 => Space
  | _ => UnusedKey
  };
};

addEventListener(
  document,
  "keydown",
  e => {
    let key = keyFromEvent(e);
    switch key {
    | Left => gameKeyboard.left = true
    | Right => gameKeyboard.right = true
    | Space => gameKeyboard.space = true
    | _ => ()
    };
  }
);

addEventListener(
  document,
  "keyup",
  e => {
    let key = keyFromEvent(e);
    switch key {
    | Left => gameKeyboard.left = false
    | Right => gameKeyboard.right = false
    | Space => gameKeyboard.space = false
    | _ => ()
    };
  }
);

let rec gameLoop = (state, keyboard, canvas, frameId) => {
  let nextState = tick(state, keyboard);
  draw(nextState, canvas);
  requestAnimationFrame(gameLoop(nextState, keyboard, canvas));
};

let canvas = getElementById("screen");

let screen = getContext2d(canvas);

let startButton = getElementById("start");

let initialBoard = makeGameBoard(canvas);

let startGame = () => {
  gameLoop(initialBoard, gameKeyboard, canvas, 0);
  ();
};

addEventListener(startButton, "click", e => startGame());