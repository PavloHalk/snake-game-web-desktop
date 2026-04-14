import Food from './Food.js';

export default class Maze {
    mazeArr = [];
    #mazeContainer = null;
    #foods = [];
    
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
        const food = new Food(this.#randomInt(10, 120));

        while (true) {
            //@todo: Exit cycle if there is no more space to place food.
            //@todo: Improve algorithm. Exclude cells with snake and food before choosing cell to put food. 
            
            const row = this.#randomInt(0, this.#rowsCount - 1);
            const col = this.#randomInt(0, this.#colsCount - 1);

            if (this.mazeArr[row][col].querySelector('.snake') || this.mazeArr[row][col].querySelector('.food')) {
                continue;
            }

            this.mazeArr[row][col].append(food.getElement());
            this.#foods.push(food);

            break;
        }
    }
    
    checkFoods() {
        this.#foods = this.#foods.filter(food => food && !food.rot());
    }

    placeFoodInRandomTime() {
        if (
            this.#foods.length === 0 && this.#randomInt(0, 1) === 0 ||
            this.#foods.length === 1 && this.#randomInt(0, 100) === 0 ||
            this.#foods.length === 2 && this.#randomInt(0, 200) === 0 ||
            this.#foods.length === 3 && this.#randomInt(0, 300) === 0 ||
            this.#foods.length === 4 && this.#randomInt(0, 500) === 0 ||
            this.#foods.length === 5 && this.#randomInt(0, 750) === 0 ||
            this.#foods.length === 6 && this.#randomInt(0, 1500) === 0 ||
            this.#foods.length === 7 && this.#randomInt(0, 3000) === 0 ||
            this.#foods.length === 8 && this.#randomInt(0, 5000) === 0 ||
            this.#foods.length === 9 && this.#randomInt(0, 10000) === 0
        ) {
            this.placeFood();
        }
    }
    
    removeFood(row, col) {
        const foodElement = this.mazeArr[row][col].querySelector('.food');
        if (foodElement) {
            foodElement.remove();

            this.#foods = this.#foods.map(food => food.getId().toString() !== foodElement.dataset.foodId ? food : null);
            this.#foods = this.#foods.filter(food => food);
            
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