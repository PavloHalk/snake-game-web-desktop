export default class Maze {
    mazeArr = [];
    #mazeContainer = null;
    #foodCount = 0;
    
    #rowsCount = 0;
    #colsCount = 0;
    
    constructor(container, rows, cols) {
        this.#mazeContainer = container;
        this.mazeArr = [];
        
        this.#rowsCount = rows;
        this.#colsCount = cols;
        
        for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
            const rowElement = document.createElement('div');
            rowElement.className = 'row';
            this.mazeArr[rowIndex] = [];

            for (let cellIndex = 0; cellIndex < cols; cellIndex++) {
                const cellElement = document.createElement('div');
                cellElement.className = "cell";

                this.mazeArr[rowIndex][cellIndex] = cellElement;
                rowElement.append(cellElement);
            }

            container.append(rowElement);
        }
    }

    placeSnake(snake) {
        for (const snakePartElement of this.#mazeContainer.querySelectorAll('.snake')) {
            snakePartElement.remove();
        }

        for (const snakePart of snake.getBody()) {
            this.mazeArr[snakePart.row][snakePart.col].append(snakePart.el);
        }
    }

    placeFood() {
        const foodElement = document.createElement('div');
        foodElement.className = 'food';

        while (true) {
            //@todo: Exit cycle if there is no more space to place food.
            //@todo: Improve algorithm. Exclude cells with snake and food before choosing cell to put food. 
            
            const row = this.#randomInt(0, this.#rowsCount - 1);
            const col = this.#randomInt(0, this.#colsCount - 1);

            if (this.mazeArr[row][col].querySelector('.snake') || this.mazeArr[row][col].querySelector('.food')) {
                continue;
            }

            this.mazeArr[row][col].append(foodElement);
            this.#foodCount++;

            break;
        }
    }

    placeFoodInRandomTime() {
        if (
            this.#foodCount === 0 && this.#randomInt(0, 1) === 0 ||
            this.#foodCount === 1 && this.#randomInt(0, 160) === 0 ||
            this.#foodCount === 2 && this.#randomInt(0, 300) === 0 ||
            this.#foodCount === 3 && this.#randomInt(0, 500) === 0 ||
            this.#foodCount === 4 && this.#randomInt(0, 700) === 0 ||
            this.#foodCount === 5 && this.#randomInt(0, 1000) === 0 ||
            this.#foodCount === 6 && this.#randomInt(0, 8000) === 0 ||
            this.#foodCount === 7 && this.#randomInt(0, 25000) === 0 ||
            this.#foodCount === 8 && this.#randomInt(0, 50000) === 0 ||
            this.#foodCount === 9 && this.#randomInt(0, 100000) === 0
        ) {
            this.placeFood();
        }
    }
    
    removeFood(row, col) {
        const food = this.mazeArr[row][col].querySelector('.food');
        if (food) {
            food.remove();
            this.#foodCount--;
            
            return true;
        }
        
        return false;
    }
    
    getRowsCount() {
        return this.#rowsCount;
    }
    
    getColsCount() {
        return this.#colsCount;
    }

    #randomInt(start, end) {
        if (start > end) {
            [start, end] = [end, start];
        }

        return Math.floor(Math.random() * (end - start + 1)) + start;
    }
}