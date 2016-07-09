
function play() {

    initParameters();
    initBoard();
    platform = new Platform();
    ball = new Ball();

    //draw platform and ball
    platform.draw();
    ball.draw();

    //move the ball at the given PACE in ms
    setInterval(launchBall, PACE);

    //moving the platform with mouse
    board.addEventListener("mousemove", function(event) {
        platform.move(event);
    });

}

function initParameters() {

    CELL_SIZE = 50;
    //the board is represented by a BOARD_SIZE * BOARD_SIZE quadratic matrix
    BOARD_SIZE = 13;

    //define how quickly the ball will move
    STEP_X = -2;
    STEP_Y = -2;
    //how often the ball is launched in ms
    PACE = 5;

    COLORS = {
        BACKGROUND: 'black',
        BALL: 'red',
        PLATFORM: 'red'
    };

    IMAGES = {
        BALL: 'images/cell.png',
        PLATFORM: 'images/platform.png',
        CELL: 'images/cell.png'
    }
}

function initBoard() {

    board = document.getElementById("board");
    context = board.getContext('2d');
    board.width  = CELL_SIZE * BOARD_SIZE;
    board.height = CELL_SIZE * BOARD_SIZE;

    //draw the board
    context.fillStyle = COLORS.BACKGROUND;
    context.fillRect(0, 0, board.width, board.height);

    //define the initial cell blocks randomly
    board.cells = initRandomMatrix(BOARD_SIZE);
    fillBoardWithCells(board.cells);

    //checking if there are no blocked cells, the winning condition
    board.isEmpty = function() {
        for (var i = 0; i < this.cells.length; i++) {
            for (var j = 0; j < this.cells[i].length; j++) {
                if(this.cells[i][j].isBlocked != 0) {
                    return false;
                }
            }
        }
        return true;
    }

}

function Platform() {

    this.width = 3 * CELL_SIZE;
    this.height = 0.7 * CELL_SIZE;
    this.imageSrc = IMAGES.PLATFORM;
    this.x = board.width / 2 - this.width;
    this.y = board.height - this.height;

    this.draw = function () {

        //draw the rectangular platform
        context.fillStyle = COLORS.PLATFORM;
        context.fillRect(this.x, this.y, this.width, this.height);

        //add gloss
        var image = new Image();
        image.src = this.imageSrc;
        image.onload =
            context.drawImage(image, this.x, this.y, this.width, this.height);

    };

    this.hide = function () {

        context.fillStyle = COLORS.BACKGROUND;
        context.fillRect(this.x, this.y, this.width, this.height);

    };

    this.move = function(e) {

        var x = e.clientX;
        if (this.width / 2 < x && x < board.width - this.width / 2) {
            this.hide();
            this.x = x - this.width / 2;
            this.draw();
        }
    }

}

function Ball() {

    this.size = CELL_SIZE;
    this.x = board.width / 2 - this.size / 2;
    this.y = board.height - platform.height - this.size;

    this.draw =  function () {

        //draw the ball
        context.beginPath();
        var radius = this.size / 2;
        context.arc(this.x + radius, this.y + radius, radius, 0, 2 * Math.PI, false);
        context.fillStyle = COLORS.BALL;
        context.fill();
        context.stroke();

        //add gloss from the image
        var image = new Image();
        image.src = IMAGES.BALL;
        image.onload =
            context.drawImage(image, this.x, this.y, this.size, this.size);

    };

    this.hide = function () {

        context.beginPath();
        var radius = this.size / 2;
        context.arc(this.x + radius, this.y + radius, radius, 0, 2 * Math.PI, false);
        context.fillStyle = COLORS.BACKGROUND;
        context.strokeStyle = COLORS.BACKGROUND;
        context.fill();
        context.stroke();

    };
}

function Cell(x, y, isBlocked) {

    this.x = x;
    this.y = y;
    this.width = CELL_SIZE;
    this.height = CELL_SIZE;
    this.isBlocked = isBlocked;

    this.draw = function () {

        var image = new Image();
        image.src = IMAGES.CELL;
        image.onload =
            context.drawImage(image, this.x, this.y, this.width, this.height);

    };

    this.hide = function() {

        context.fillStyle = COLORS.BACKGROUND;
        context.fillRect(this.x, this.y, CELL_SIZE, CELL_SIZE);

    };

}

function fillBoardWithCells(matrix) {

    //draw a cell if the matrix element is blocked (contains 1 instead of 0)
    for(var i = 0; i < matrix.length; i++) {
        for(var j = 0; j < matrix[i].length; j++) {

            if(matrix[i][j] == 1) {
                matrix[i][j] = new Cell(i * CELL_SIZE, j * CELL_SIZE, 1);
                matrix[i][j].draw();
            } else {
                matrix[i][j] = new Cell(i * CELL_SIZE, j * CELL_SIZE, 0);
            }

        }
    }
}

function launchBall() {

    //if the ball hits the ceiling or the platform, it bounces off
    if(ball.y <= 0 || isHit(ball, platform)) {
        //changing direction
        STEP_Y = -STEP_Y;
    }
    
    //if the ball hits the left or the right wall, it bounces off
    if(ball.x <= 0 || ball.x >= board.width - ball.size) {
        //changing direction
        STEP_X = -STEP_X;
    }
    
    //if the ball hits any cell that is blocked, it bounces off
    if (isHitAnyFromMatrix(ball, board.cells)) {
        //changing direction
        STEP_Y = -STEP_Y;

        //checking if all the blocks have disappeared
        if (board.isEmpty()) {
            alert("You win!");
            //start again
            document.location.reload();
        }
    }

    //if the ball falls down, game is over
    if(ball.y >= board.height - ball.size) {
        alert("Game over!");
        document.location.reload();
    }

    ball.hide();
    //if the ball hits the platform, the edge of it can be hidden along with the ball itself,
    //redraw the platform to avoid this
    platform.draw();

    //the ball continues to move
    ball.y += STEP_Y;
    ball.x += STEP_X;
    ball.draw();

}

//supplementary functions

function initRandomMatrix(size) {

    var matrix = [];
    for(var i = 0; i < size; i++) {
        matrix[i] = [];
        for (var j = 0; j < size; j++) {
            //leave some empty space for the ball
            if(j > size / 3) {
                matrix[i][j] = 0;
            } else {
                matrix[i][j] = Math.round(Math.random());
            }
        }
    }
    return matrix;

}

function isHitAnyFromMatrix(movingObject, matrixToBeHit) {

    //checking if any cell that is blocked was hit by the ball
    for (var i = 0; i < matrixToBeHit.length; i++) {
        for (var j = 0; j < matrixToBeHit[i].length; j++) {
            if(matrixToBeHit[i][j].isBlocked == 1) {
                if (isHit(movingObject, matrixToBeHit[i][j])) {
                    matrixToBeHit[i][j].isBlocked = 0;
                    matrixToBeHit[i][j].hide();
                    return true;
                }
            }
        }
    }
    return false;

}

function isHit(movingObject, objectToBeHit) {

    //the coordinates of the moving object:
    // (x1, y1), (x2, y1)
    // (x1, y2), (x2, y2)
    var x1 = movingObject.x,
        x2 = movingObject.x + movingObject.size,
        y1 = movingObject.y,
        y2 = movingObject.y + movingObject.size;

    //the coordinates of the object to be hit:
    // (x3, y3), (x4, y3)
    // (x3, y4), (x4, y4)
    var x3 = objectToBeHit.x,
        x4 = objectToBeHit.x + objectToBeHit.width,
        y3 = objectToBeHit.y,
        y4 = objectToBeHit.y + objectToBeHit.height;

    if (x1 > x4 || x2 < x3 || y1 > y4 || y2 < y3)
    {
        return false
    }
    return true;

}

