import { getStorageItem, setStorageItem } from "./pyStorage.js";
import {
    placeInScreenCenter,
    initColorIndicators,
    updateIndicators,
    fillColorPicker,
    initColorPicker
} from "./forms.js";

let name = '';
let speed = 6;
let hiScore = 0;
let score = 0;
let foodInMaze = 0;
const maze = [];

document.addEventListener('DOMContentLoaded', () => {
    const formSettings = document.forms['form-settings'];
    const formGameOver = document.forms['form-game-over'];
    const formColorPicker = document.forms['form-color-picker'];
    
    fillColorPicker(formColorPicker);
    initColorPicker(formColorPicker);
    
    placeInScreenCenter(formSettings);
    placeInScreenCenter(formGameOver);
    placeInScreenCenter(formColorPicker);
    window.addEventListener('resize', () => {
        placeInScreenCenter(formSettings);
        placeInScreenCenter(formGameOver);
        placeInScreenCenter(formColorPicker);
    });
    initColorIndicators();

    const snake = new Snake();

    buildMaze(document.getElementById('maze'));
    placeSnake(snake);

    formSettings.elements['btn-default-colors'].addEventListener('click', () => {
        for (const element of formSettings.elements['settings-advanced'].querySelectorAll('input[type="text"]')) {
            element.value = element.defaultValue;
            element.dispatchEvent(new Event('input'));
        }
    });
    formSettings.elements['btn-play'].addEventListener('click', () => {
        play(snake);
    });
    formGameOver.elements['btn-play-again'].addEventListener('click', () => {
        playAgain(snake);
    });
    document.getElementById('btn-restart').addEventListener('click', () => {
        restart(snake);
    });
    
    setTimeout(updateInitialValues, 1000);

    function updateInitialValues () {
        (async () => {
            name = await getStorageItem('last-user-name', 'Anonymous');
            speed = await getStorageItem('last-speed', '6');
            hiScore = (await getScoreTable())[0]?.score ?? 0;
            const colors = await getStorageItem('colors', {});
            
            formSettings.elements['input-username'].value = name;
            formSettings.elements['input-speed'].value = speed;
            
            for (const elementName in colors) {
                formSettings.elements[elementName].value = colors[elementName];
                formSettings.elements[elementName].dispatchEvent(new Event('input'));
            }
            for (const element of formSettings.elements['settings-advanced'].querySelectorAll('input[type="text"]')) {
                element.removeAttribute('disabled');
            }
            
            formSettings.elements['input-username'].removeAttribute('disabled');
            formSettings.elements['input-username'].focus();
            formSettings.elements['input-speed'].removeAttribute('disabled');
            formSettings.elements['btn-default-colors'].removeAttribute('disabled');
            formSettings.elements['btn-play'].removeAttribute('disabled');
            updateIndicators(speed, score, hiScore);
        })();
    }
});

function Snake() {
    this.body = [];
    
    this.rebuild();
    
    this.vectorRow = 0;
    this.vectorCol = 1;
    this.interval = null;
    this.maxRow = 19;
    this.maxCol = 49;
    this.grow = 0;
    this.isMoveInStep = false;
    this.boundKeydown = this.keydown.bind(this);
}

Snake.prototype.rebuild = function() {
    this.body = [];
    
    for (let i = 0; i < 1; i++) {
        const el = document.createElement('div');
        el.className = 'snake';

        this.body.push({
            el: el,
            row: 10,
            col: 25 - i
        });
    }
}

Snake.prototype.step = function() {
    let current = { row: null, col: null }
    let previous = { row: null, col: null }
    
    for (const part of this.body) {
        if (previous.row === null) {
            previous.row = part.row;
            previous.col = part.col;
            
            let newRow = part.row + this.vectorRow;
            let newCol = part.col + this.vectorCol;

            if (newRow > this.maxRow) {
                newRow = 0;
            } else if (newRow < 0) {
                newRow = this.maxRow;
            }

            if (newCol > this.maxCol) {
                newCol = 0;
            } else if (newCol < 0) {
                newCol = this.maxCol;
            }
            
            if (maze[newRow][newCol].querySelectorAll('.snake').length) {
                this.stop();
                
                for (const part of this.body) {
                    part.el.classList.add('dead');
                }

                document.forms['form-game-over'].querySelector('table')?.remove();
                putToScoreTable(name, score)
                    .then(() => {
                        return buildScoreTableElement();
                    })
                    .then(table => {
                        document.forms['form-game-over'].querySelector('.score-table-container').append(table);
                    })
                    .finally(() => {
                        document.forms['form-game-over'].closest('.form-overlay').hidden = false;
                        placeInScreenCenter(document.forms['form-game-over']);
                    });
                break;
            }
            
            part.row = newRow;
            part.col = newCol;

            this.eat(part.row, part.col);
        } else {
            current.row = part.row;
            current.col = part.col;
            
            part.row = previous.row;
            part.col = previous.col;

            previous.row = current.row;
            previous.col = current.col;
        }
        
        part.el.remove();
        
        maze[part.row][part.col].append(part.el);
        this.isMoveInStep = false;
    }
    
    if (this.grow > 0) {
        const part = document.createElement('div');
        part.className = 'snake';
        
        this.body.push({
            el: part,
            row: previous.row,
            col: previous.col
        });
        maze[previous.row][previous.col].append(part);
        this.grow--;
    }
    
    updateIndicators(speed, score, hiScore);
    placeFoodInRandomTime();
}

Snake.prototype.go = function() {
    document.addEventListener('keydown', this.boundKeydown);
    this.interval = setInterval(this.step.bind(this), 1000 * (1 / speed));
}

Snake.prototype.stop = function() {
    clearInterval(this.interval);
    document.removeEventListener('keydown', this.boundKeydown);
    
    this.vectorRow = 0;
    this.vectorCol = 1;
}

Snake.prototype.eat = function(row, col) {
    const food = maze[row][col].querySelector('.food');
    if (food) {
        food.remove();
        foodInMaze--;
        score = score + Math.round((speed > 12 ? 13 : speed) * 1.4);
        if (score > hiScore) {
            hiScore = score;
        }
        this.grow++;
        
        return true;
    }
    
    return false;
}

Snake.prototype.keydown = function(event) {
    if (this.isMoveInStep) return;

    this.isMoveInStep = true;

    if (event.code === 'ArrowUp' && this.vectorRow !== 1) {
        this.vectorRow = -1;
        this.vectorCol = 0;
    }  else if (event.code === 'ArrowDown' && this.vectorRow !== -1) {
        this.vectorRow = 1;
        this.vectorCol = 0;
    } else if (event.code === 'ArrowLeft' && this.vectorCol !== 1) {
        this.vectorRow = 0;
        this.vectorCol = -1;
    } else if (event.code === 'ArrowRight' && this.vectorCol !== -1) {
        this.vectorRow = 0;
        this.vectorCol = 1;
    }
}

function buildMaze(mazeElement) {
    for (let rowIndex = 0; rowIndex < 20; rowIndex++) {
        const rowElement = document.createElement('div');
        rowElement.className = 'row';
        maze[rowIndex] = [];
        
        for (let cellIndex = 0; cellIndex < 50; cellIndex++) {
            const cellElement = document.createElement('div');
            cellElement.className = "cell";

            maze[rowIndex][cellIndex] = cellElement;
            rowElement.append(cellElement);
        }
        
        mazeElement.append(rowElement);
    }
}

function placeSnake(snake) {
    for (const snakePartElement of document.querySelectorAll('.snake')) {
        snakePartElement.remove();
    }
    
    for (const snakePart of snake.body) {
        maze[snakePart.row][snakePart.col].append(snakePart.el);
    }
}

function placeFood() {
    const foodElement = document.createElement('div');
    foodElement.className = 'food';
    
    while (true) {
        const row = randomInt(0, 19);
        const col = randomInt(0, 49);
        
        if (maze[row][col].querySelector('.snake') || maze[row][col].querySelector('.food')) {
            continue;
        }
        
        maze[row][col].append(foodElement);
        foodInMaze++;
        
        break;
    }
}

function placeFoodInRandomTime() {
    if (
        foodInMaze === 0 && randomInt(0, 1) === 0 ||
        foodInMaze === 1 && randomInt(0, 160) === 0 ||
        foodInMaze === 2 && randomInt(0, 300) === 0 ||
        foodInMaze === 3 && randomInt(0, 500) === 0 ||
        foodInMaze === 4 && randomInt(0, 700) === 0 ||
        foodInMaze === 5 && randomInt(0, 1000) === 0 ||
        foodInMaze === 6 && randomInt(0, 8000) === 0 ||
        foodInMaze === 7 && randomInt(0, 25000) === 0 ||
        foodInMaze === 8 && randomInt(0, 50000) === 0 ||
        foodInMaze === 9 && randomInt(0, 100000) === 0
    ) {
        placeFood();
    }
}

function randomInt(start, end) {
    if (start > end) {
        [start, end] = [end, start];
    }

    return Math.floor(Math.random() * (end - start + 1)) + start;
}

async function getScoreTable() {
    let scoreTable = await getStorageItem('score-table', []);
    if (!scoreTable) {
        scoreTable = [];
        await setStorageItem('score-table', scoreTable);
    }
    
    return scoreTable.slice(0, 20);
}

async function putToScoreTable(name, score) {
    let scoreTable = await getScoreTable();
    scoreTable.push({ name: name, score: score, date: (new Date()).toISOString().substring(0, 10) });
    scoreTable.sort((a, b) => {
        return b.score - a.score;
    });
    await setStorageItem('score-table', scoreTable);
}

function play(snake) {
    const formSettings = document.forms['form-settings'];
    
    document.documentElement.style.setProperty('--snake-color', formSettings.elements['input-snake-color'].value);
    document.documentElement.style.setProperty('--food-color', formSettings.elements['input-food-color'].value);
    document.documentElement.style.setProperty('--grid-color', formSettings.elements['input-grid-color'].value);
    document.documentElement.style.setProperty('--cells-bg', formSettings.elements['input-cells-bg'].value);
    
    name = formSettings.elements['input-username'].value;
    speed = parseInt(formSettings.elements['input-speed'].value);
    if (!speed) {
        speed = 1;
    } else if (speed > 12 && speed !== 67) {
        speed = 12;
    }
    setStorageItem('last-user-name', name)
        .then(() => {
            return setStorageItem('last-speed', speed);
        })
        .then(() => {
            return setStorageItem('colors', {
                'input-snake-color': formSettings.elements['input-snake-color'].value,
                'input-food-color': formSettings.elements['input-food-color'].value,
                'input-grid-color': formSettings.elements['input-grid-color'].value,
                'input-cells-bg': formSettings.elements['input-cells-bg'].value
            });
        });
    
    formSettings.closest('.form-overlay').hidden = true;
    snake.go();
}

function playAgain(snake) {
    document.forms['form-game-over'].closest('.form-overlay').hidden = true;
    document.forms['form-settings'].closest('.form-overlay').hidden = false;
    placeInScreenCenter(document.forms['form-settings']);
    document.forms['form-settings'].elements['input-username'].focus();
    score = 0;
    
    snake.rebuild();
    placeSnake(snake);
}

function restart(snake) {
    snake.stop();
    playAgain(snake);
}

async function buildScoreTableElement() {
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>#</th><th>Username</th><th>Score</th><th>Date</th></tr></thead><tbody></tbody>';
    
    const scores = await getScoreTable();
    let isYou = false;
    let isYouSet = false;
    const now = (new Date()).toISOString().substring(0, 10);
    scores.forEach((rowData, index) => {
        const row = document.createElement('tr');
        isYou = now === rowData.date && name === rowData.name && score === rowData.score;
        row.innerHTML = '<td>'+(index+1)+'</td><td>'+rowData.name+'</td><td>'+rowData.score+'</td><td>'+(rowData.date ?? "")+'</td>';
        if (!isYouSet && isYou) {
            row.className = 'you';
            isYouSet = true;
        }
        table.tBodies[0].append(row);
    });
    
    return table;
}