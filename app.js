import Maze from './Maze.js';
import Snake from './Snake.js';
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
let size = 1;

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

const maze = new Maze(document.getElementById('maze'), 20, 50);

const snake = new Snake(maze, speed, size);

formSettings.elements['btn-default-colors'].addEventListener('click', () => {
    for (const element of formSettings.elements['settings-advanced'].querySelectorAll('input[type="text"]')) {
        element.value = element.defaultValue;
        element.dispatchEvent(new Event('input'));
    }
});
formSettings.addEventListener('submit', (event) => {
    event.preventDefault();
    play(snake);
});
formGameOver.elements['btn-play-again'].addEventListener('click', () => {
    playAgain(snake, maze);
});
document.getElementById('btn-restart').addEventListener('click', () => {
    restart(snake, maze);
});

document.getElementById('maze').addEventListener('snake-death', (event) => {
    score = event.detail.score;
    hiScore = score > hiScore ? score : hiScore;
    updateIndicators(speed, score, hiScore, size);

    formGameOver.querySelector('table')?.remove();
    putToScoreTable(name, score)
        .then(() => {
            return buildScoreTableElement();
        })
        .then(table => {
            formGameOver.querySelector('.score-table-container').append(table);
        })
        .finally(() => {
            formGameOver.closest('.form-overlay').hidden = false;
            placeInScreenCenter(formGameOver);
        });
});

document.getElementById('maze').addEventListener('snake-grow', (event) => {
    score = event.detail.score;
    hiScore = score > hiScore ? score : hiScore;
    size = event.detail.size;
    updateIndicators(speed, score, hiScore, size);
});

updateInitialValues();

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
        updateIndicators(speed, score, hiScore, size);
    })();
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
    } else if (speed > 10) {
        speed = 10;
    }
    snake.setSpeed(speed);
    
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
    updateIndicators(speed, score, hiScore, size);
    snake.go();
}

function playAgain(snake, maze) {
    document.forms['form-game-over'].closest('.form-overlay').hidden = true;
    document.forms['form-settings'].closest('.form-overlay').hidden = false;
    placeInScreenCenter(document.forms['form-settings']);
    document.forms['form-settings'].elements['input-username'].focus();
    score = 0;
    size = 1;
    updateIndicators(speed, score, hiScore, size);
    
    snake.rebuild();
    maze.placeSnake(snake);
}

function restart(snake, maze) {
    snake.stop();
    playAgain(snake, maze);
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