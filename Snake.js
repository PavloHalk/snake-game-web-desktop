import Maze from "./Maze.js";

export default class Snake {
    #body = [];
    #maze = null;
    
    #interval = 0;
    
    #vectorRow = 0;
    #vectorCol = 1;
    #maxRow = 0;
    #maxCol = 0;
    #maxSize = 0;
    
    #grow = false;
    #isMoveInStep = false;

    #speed = 1;
    #score = 0;
    
    #boundKeydown = null;
    
    constructor(maze, speed = 1, size = 1) {
        if (!(maze instanceof Maze)) throw new TypeError('maze must be instance of Maze.');
        if (speed < 1 || speed > 10) throw new RangeError('Speed should be a number between 1 and 10');
        if (size < 1) throw new  RangeError('Snake size should be at least 1.');
        
        this.#maze = maze;
        this.setSpeed(speed);
        this.#maxRow = maze.getRowsCount() - 1;
        this.#maxCol = maze.getColsCount() - 1;
        this.#maxSize = this.#maxRow * this.#maxCol - 2;
        
        this.#build(Math.floor(size));
        this.#maze.placeSnake(this);
        
        this.#boundKeydown = this.#keydown.bind(this);
    }

    getBody() {
        return this.#body;
    }
    
    go() {
        document.addEventListener('keydown', this.#boundKeydown);
        this.#interval = setInterval(this.#step.bind(this), Math.round(600 * Math.pow(0.75, this.#speed - 1)));
    }
    
    stop() {
        clearInterval(this.#interval);
        document.removeEventListener('keydown', this.#boundKeydown);

        this.#vectorRow = 0;
        this.#vectorCol = 1;
    }
    
    setSpeed(speed) {
        if (speed < 1) {
            speed = 1;
        } else if (speed > 10) {
            speed = 10;
        }
        
        this.#speed = Math.floor(speed);
    }
    
    rebuild(size = 1) {
        this.#body = [];
        this.#score = 0;
        this.#build(size);
    }
    
    #build(size = 1) {
        //@todo: Place snake at row center regardless to size. Currently only head is at the center. Body is at the left.
        const maxSize = Math.floor(this.#maze.getColsCount() / 2);
        if (maxSize < size) {
            size = maxSize;
        }
        
        for (let i = 0; i < size; i++) {
            const el = document.createElement('div');
            el.className = 'snake';

            this.#body.push({
                el: el,
                row: Math.floor(this.#maze.getRowsCount() / 2) - 1,
                col: Math.floor(this.#maze.getColsCount() / 2) - i
            });
        }
    }
    
    #eat(row, col) {
        if (this.#maze.removeFood(row, col)) {
            this.#score = this.#score + Math.round(1.7 * Math.pow(this.#speed, 1.4));
            this.#grow = true;
        }
    }
    
    #step() {
        let newRow = this.#body[0].row + this.#vectorRow;
        let newCol = this.#body[0].col + this.#vectorCol;

        if (newRow > this.#maxRow) {
            newRow = 0;
        } else if (newRow < 0) {
            newRow = this.#maxRow;
        }

        if (newCol > this.#maxCol) {
            newCol = 0;
        } else if (newCol < 0) {
            newCol = this.#maxCol;
        }

        if (this.#maze.mazeArr[newRow][newCol].querySelectorAll('.snake').length) {
            this.stop();

            for (const part of this.#body) {
                part.el.classList.add('dead');
            }

            this.#emit('snake-death');
            return;
        }
        
        this.#body.unshift(this.#body.pop());
        
        const tailRow = this.#body[0].row;
        const tailCol = this.#body[0].col;
        
        this.#body[0].row = newRow;
        this.#body[0].col = newCol;
        this.#maze.mazeArr[newRow][newCol].append(this.#body[0].el);
        
        this.#eat(newRow, newCol);
        if (this.#grow) this.#growUp(tailRow, tailCol);

        this.#maze.checkFoods();
        if (this.#body.length < this.#maxSize) { // You are winner else.
            this.#maze.placeFoodInRandomTime();
        }
        
        this.#isMoveInStep = false;
    }
    
    #growUp(tailRow, tailCol) {
        const part = document.createElement('div');
        part.className = 'snake';

        this.#body.push({ el: part, row: tailRow, col: tailCol });
        this.#maze.mazeArr[tailRow][tailCol].append(part);
        this.#grow = false;
        
        this.#emit('snake-grow');
    }

    #keydown(event) {
        if (this.#isMoveInStep) return;

        this.#isMoveInStep = true;

        if (event.code === 'ArrowUp' && this.#vectorRow !== 1) {
            this.#vectorRow = -1;
            this.#vectorCol = 0;
        }  else if (event.code === 'ArrowDown' && this.#vectorRow !== -1) {
            this.#vectorRow = 1;
            this.#vectorCol = 0;
        } else if (event.code === 'ArrowLeft' && this.#vectorCol !== 1) {
            this.#vectorRow = 0;
            this.#vectorCol = -1;
        } else if (event.code === 'ArrowRight' && this.#vectorCol !== -1) {
            this.#vectorRow = 0;
            this.#vectorCol = 1;
        }
    }
    
    #emit(eventType) {
        const event = new CustomEvent(eventType, {
            bubbles: true,
            detail: {
                score: this.#score,
                size: this.#body.length
            }
        });
        this.#body[0].el.dispatchEvent(event);
    }
}