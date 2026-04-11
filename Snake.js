import Maze from "./Maze.js";

export default class Snake {
    #body = [];
    #maze = null;
    
    #interval = 0;
    
    #vectorRow = 0;
    #vectorCol = 1;
    #maxRow = 0;
    #maxCol = 0;
    
    #grow = false;
    #isMoveInStep = false;

    #speed = 1;
    #score = 0;
    
    #boundKeydown = null;
    
    constructor(maze, speed = 1, size = 1) {
        if (!(maze instanceof Maze)) throw new TypeError('maze must be instance of Maze.');
        if (speed < 1 || speed > 12) throw new RangeError('Speed should be a number between 1 and 12');
        if (size < 1) throw new  RangeError('Snake size should be at least 1.');
        
        this.#maze = maze;
        this.#speed = Math.floor(speed);
        this.#maxRow = maze.getRowsCount() - 1;
        this.#maxCol = maze.getColsCount() - 1;
        
        this.#build(Math.floor(size));
        this.#maze.placeSnake(this);
        
        this.#boundKeydown = this.#keydown.bind(this);
    }

    getBody() {
        return this.#body;
    }
    
    go() {
        document.addEventListener('keydown', this.#boundKeydown);
        this.#interval = setInterval(this.#step.bind(this), 1000 * (1 / this.#speed));
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
        } else if (speed > 12) {
            speed = 12;
        }
        
        this.#speed = Math.floor(speed);
    }
    
    rebuild(size = 1) {
        this.#body = [];
        this.#score = 0;
        this.#build(size);
    }
    
    #build(size = 1) {
        //@todo: Throw error when maze is too small to place snake.
        
        for (let i = 0; i < size; i++) {
            const el = document.createElement('div');
            el.className = 'snake';

            this.#body.push({
                el: el,
                row: this.#maze.getRowsCount() / 2 - 1,
                col: this.#maze.getColsCount() / 2 - i
            });
        }
    }
    
    #eat(row, col) {
        if (this.#maze.removeFood(row, col)) {
            this.#score = this.#score + Math.round((this.#speed > 12 ? 13 : this.#speed) * 1.3);
            this.#grow = true;
            
            this.#emit('snake-eat');
        }
    }

    #step() {
        //@todo: Improve algorithm. Move only last tail block to the head instead of moving whole snake.
        
        let current = { row: null, col: null }
        let previous = { row: null, col: null }

        for (const part of this.#body) {
            if (previous.row === null) {
                previous.row = part.row;
                previous.col = part.col;

                let newRow = part.row + this.#vectorRow;
                let newCol = part.col + this.#vectorCol;

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
                    
                    break;
                }

                part.row = newRow;
                part.col = newCol;

                this.#eat(part.row, part.col);
            } else {
                current.row = part.row;
                current.col = part.col;

                part.row = previous.row;
                part.col = previous.col;

                previous.row = current.row;
                previous.col = current.col;
            }

            part.el.remove();

            this.#maze.mazeArr[part.row][part.col].append(part.el);
            this.#isMoveInStep = false;
        }

        if (this.#grow) {
            const part = document.createElement('div');
            part.className = 'snake';

            this.#body.push({
                el: part,
                row: previous.row,
                col: previous.col
            });
            this.#maze.mazeArr[previous.row][previous.col].append(part);
            this.#grow = false;
        }

        this.#maze.placeFoodInRandomTime();
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
                length: this.#body.length
            }
        });
        this.#body[0].el.dispatchEvent(event);
    }
}