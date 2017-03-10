/*
 Puzzle game Script file
 */
unit = "px";

/**
 * Box where the puzzle pieces can be dragged onto.
 * @param coordinates
 * @param boxSize
 * @param gridPosition
 * @constructor
 */
function PuzzleBox(coordinates, boxSize, gridPosition) {
    this.coordinates = coordinates;
    this.boxSize = boxSize;
    this.gridPosition = gridPosition;
    this.getId = function () {
        console.log("box--" + gridPosition.x + '_' + gridPosition.y);
        return  "box--" + gridPosition.x + '_' + gridPosition.y;
    };
    this.box = $("<div class='well'>").height(boxSize).width(boxSize)
        .addClass(this.getId())
        .css('margin-bottom', "15px");

    this.createPiece = function (image) {
        return (new PuzzlePiece(image, this.coordinates, this.boxSize, this.gridPosition, this.getId())).piece;
    };
}


/**
 * A grid of PuzzleBoxes each corresponding to a different tile.
 * @param rowCount
 * @param columnCount
 * @param boxSize
 * @param boxGap
 * @constructor
 */
function PuzzleBoard(rowCount, columnCount, boxSize, boxGap) {
    this.rowCount = rowCount;
    this.columnCount = columnCount;
    this.boxSize = boxSize;
    this.boxGap = boxGap;
    this.boxes = [];
    this.imagePadding = {"x": 0, "y": 0};
    self = this;



    this.getDimensions = function () {
        var x = this.rowCount * this.boxSize + (this.rowCount - 1) * boxGap;
        var y = this.columnCount * this.boxSize + (this.columnCount - 1) * boxGap;
        return  {"x": x, "y": y};
    };


    this.setImage = function (image) {
        this.image = image;
        var internalImageDimensions = this.getDimensions();
        this.imagePadding = {
            "x": 0.5*(this.image.imageWidth - internalImageDimensions.x),
            "y": 0.5*(this.image.imageHeight - internalImageDimensions.y)
        };
        return this;
    };


    this.createBoxes = function (imagePadding) {
        if (typeof imagePadding === 'undefined') {
            imagePadding = this.imagePadding;
        }
        console.log(imagePadding);
        for ( var gridPositionX = 0; gridPositionX < this.columnCount; gridPositionX++ ) {

            var cells = [];
            for (var gridPositionY = 0; gridPositionY < this.rowCount; gridPositionY++ ) {
                var x = imagePadding.x + gridPositionX * (this.boxSize+this.boxGap);
                var y = imagePadding.y + gridPositionY * (this.boxSize+this.boxGap);
                var cell = this.createBox({"x": x, "y": y}, {"x": gridPositionX, "y": gridPositionY});
                cells.push(cell);
            }
            this.boxes.push(cells);
        }
        return this;
    };

    this.placeBoxes = function (selector, mainElement, withImage) {
        var playFieldRows  = [];
        var columnWidth = Math.floor(12 / this.columnCount);
        for (var y=0; y<this.rowCount; y++ ) {
            var row = $("<div class='row'>");
            for (var x=0; x<this.columnCount; x++) {
                var column = $("<div>");
                column.addClass("col-xs-"+columnWidth);
                column.addClass("col-sm-"+columnWidth);
                column.addClass("col-md-"+columnWidth);
                column.addClass("col-lg-"+columnWidth);
                if (typeof withImage !== 'undefined' && withImage) {
                    column.append(this.boxes[x][y].createPiece(this.image));
                } else {
                    column.append(this.boxes[x][y].box);
                }
                row.append(column);
            }
            mainElement.append(row);
        }
/*
        this.boxes.map(function (field) {
            var tile = field.box.wrap()
        });
*/
        selector.append(mainElement);
    };

    this.createBox = function (coordinates, gridPosition) {
        return new PuzzleBox(coordinates, this.boxSize, gridPosition)

    }

}
/**
 * A draggable tile of an image that can be dragged to a corresponding box.
 * @param image
 * @param imageCoordinate
 * @param pieceSize
 * @param gridPosition
 * @param id
 * @constructor
 */
function PuzzlePiece(image, imageCoordinate, pieceSize, gridPosition, id) {
    this.id = id;
    this.piece = $("<div class='well'>");
    this.piece.css({
        "background-image": image.imageURL,

        "background-position-x": image.imageWidth - imageCoordinate.x,
        "background-position-y": image.imageHeight - imageCoordinate.y,
        "background-size": image.imageWidth + unit + " " + image.imageHeight + unit

    }).height(pieceSize).width(pieceSize).addClass(id);
    self = this;
    this.piece.draggable({revert: true, snap: "."+ this.id, snapMode: "inner", drag: function () {
        var className = this.className.split("box--")[1].split(" ")[0];
        var elements = $('.box--'+className);
        console.log(className);

        var offset1 = $(elements[0]).offset();
        var offset2 = $(elements[1]).offset();
        //console.log(self);
        var distance = Math.pow(Math.pow(offset1.top-offset2.top,2)+Math.pow(offset1.left-offset2.left, 2),0.5);
        console.log(distance);
        if (Math.floor(distance) === 0) {
            $( this ).draggable( "option", "revert", false );
            $(this).draggable({ disabled: true });

        }

    }});
    this.gridPosition = gridPosition;
}

/**
 * An image that can be split into PuzzlePieces.
 * @param imageURL
 * @param imageWidth
 * @param imageHeight
 * @constructor
 */
function PuzzleImage(imageURL, imageWidth, imageHeight) {
    this.imageURL = "url(" + imageURL + ")";
    this.imageWidth = imageWidth;
    this.imageHeight = imageHeight;
    this.pieces = [];
    self = this;

    /**
     * Use PuzzleBoard instance to create the pieces
     * @param {PuzzleBoard} puzzleBoard
     * @returns {Array}
     */
    this.createPieces = function (puzzleBoard) {

        puzzleBoard.boxes.map(function (boxRow) {
            boxRow.map(function (box) {
                console.log(box);
                // @var {PuzzleBox} box
                var piece = box.createPiece(self);
                self.pieces.push(piece);
            });

        });
        return this;
    };


}


/**
 * Helper function to shuffle an array.
 * URL: http://stackoverflow.com/a/6274398
 * @param array
 * @returns {*}
 */
function shuffle(array) {
    var counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        var index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        var temp = array[counter];
        // Make it recursive!
        if (Array.isArray(temp)) {
            temp = shuffle(temp);
        }
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

shuffledContainer = $("#puzzle--source");
orderedContainer = $("#puzzle--destination");
playField = $("#puzzle-playfield");

var electronics = new PuzzleImage("img/20160901_223715.jpg", 640, 360);


destination = new PuzzleBoard(3, 4, 80, 15);
destination.setImage(electronics).createBoxes();
destination.placeBoxes(playField, $("<div class='col-xs-5'>"));

source = new PuzzleBoard(3, 4, 80, 15);
source.setImage(electronics).createBoxes();
source.boxes = shuffle(source.boxes);
source.placeBoxes(playField, $("<div class='col-xs-5 col-xs-offset-2'>"), true);



//pieces = electronics.createPieces(destination);


