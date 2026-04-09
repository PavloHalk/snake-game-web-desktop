import { cssColors } from "./csscolors.js";

export function placeInScreenCenter(element) {
    element.style.left = (document.documentElement.clientWidth / 2 - element.offsetWidth / 2) + 'px';
    element.style.top = (document.documentElement.clientHeight / 2 - element.offsetHeight / 2) + 'px';
}

export function initColorIndicators() {
    const snakeIndicator = document.getElementById('color-indicator-snake');
    const foodIndicator = document.getElementById('color-indicator-food');
    const gridIndicator = document.getElementById('color-indicator-grid');
    const cellsIndicator = document.getElementById('color-indicator-cells-bg');

    snakeIndicator.style.backgroundColor = document.forms['form-settings'].elements['input-snake-color'].value;
    foodIndicator.style.backgroundColor = document.forms['form-settings'].elements['input-food-color'].value;
    gridIndicator.style.backgroundColor = document.forms['form-settings'].elements['input-grid-color'].value;
    cellsIndicator.style.backgroundColor = document.forms['form-settings'].elements['input-cells-bg'].value;

    document.forms['form-settings'].elements['input-snake-color'].addEventListener('input', (event) => {
        snakeIndicator.style.backgroundColor = event.currentTarget.value;
    });
    document.forms['form-settings'].elements['input-food-color'].addEventListener('input', (event) => {
        foodIndicator.style.backgroundColor = event.currentTarget.value;
    });
    document.forms['form-settings'].elements['input-grid-color'].addEventListener('input', (event) => {
        gridIndicator.style.backgroundColor = event.currentTarget.value;
    });
    document.forms['form-settings'].elements['input-cells-bg'].addEventListener('input', (event) => {
        cellsIndicator.style.backgroundColor = event.currentTarget.value;
    });
    
    snakeIndicator.addEventListener('click', onIndicatorClick);
    foodIndicator.addEventListener('click', onIndicatorClick);
    gridIndicator.addEventListener('click', onIndicatorClick);
    cellsIndicator.addEventListener('click', onIndicatorClick);

    const formColorPicker = document.forms['form-color-picker'];
    
    function onIndicatorClick(event) {
        formColorPicker.closest('.form-overlay').hidden = false;
        placeInScreenCenter(formColorPicker);
        formColorPicker.elements['btn-select-color'].dataset.targetIndicatorId = event.target.id;
        formColorPicker.elements['btn-select-color'].dataset.targetInputId = event.target.parentElement.querySelector('input').id;
        selectColorPickerColor(formColorPicker, event.target.style.backgroundColor);
    }

    formColorPicker.elements['btn-select-color'].addEventListener('click', (event) => {
        const indicator = document.getElementById(event.target.dataset.targetIndicatorId);
        const input = document.getElementById(event.target.dataset.targetInputId);
        
        indicator.style.backgroundColor = formColorPicker.querySelector('.color-indicator').style.backgroundColor;
        input.value = formColorPicker.querySelector('.color-indicator').style.backgroundColor;

        formColorPicker.closest('.form-overlay').hidden = true;
    });
}

export function updateIndicators(speed, score, hiScore) {
    document.querySelector('.speed-value').innerText = speed;
    document.querySelector('.score-value').innerText = score;
    document.querySelector('.hiscore-value').innerText = hiScore;
}

export function fillColorPicker(formElement) {
    const container = formElement.querySelector('.color-sample-container');
    const fragment = new DocumentFragment();
    let row = null;
    
    cssColors.forEach((color, index) => {
        if (index % 14 === 0) {
            row = document.createElement('div');
            row.className = 'color-sample-row';
            fragment.append(row);
        }
        
        const el = document.createElement('div');
        el.className = 'color-sample';
        el.style.backgroundColor = color.name;
        el.title = color.name;
        el.dataset.colorIndex = index;
        row.append(el);
    });
    
    container.append(fragment);
}

export function initColorPicker(formElement) {
    formElement.addEventListener('click', listenColorPicker);
    formElement.addEventListener('input', listenColorPickerInput);
    formElement.addEventListener('change', listenColorPickerChange);
}

export function revokeColorPicker(formElement) {
    formElement.removeEventListener('click', listenColorPicker);
    formElement.removeEventListener('input', listenColorPickerInput);
    formElement.addEventListener('change', listenColorPickerChange);
}

export function selectColorPickerColor(form, color) {
    let hex = '';
    let r = '';
    let g = '';
    let b = '';

    if (color[0] === '#') {
        hex = color;
        r = parseInt(color.substring(1, 3), 16).toString();
        g = parseInt(color.substring(3, 5), 16).toString();
        b = parseInt(color.substring(5, 7), 16).toString();
    } else if (/(\d+),\s(\d+),\s(\d+)/.test(color)) {
        const matches = color.match(/(\d+),\s(\d+),\s(\d+)/);
        r = matches[1];
        g = matches[2];
        b = matches[3];
        const rhex = parseInt(matches[1]).toString(16).padStart(2, '0');
        const ghex = parseInt(matches[2]).toString(16).padStart(2, '0');
        const bhex = parseInt(matches[3]).toString(16).padStart(2, '0');
        hex = '#' + rhex + ghex + bhex;
    } else {
        const colorElement = cssColors.find((item) => item.name === color);
        
        hex = colorElement?.hex ?? '#000000';
        r = colorElement?.r ?? '0';
        g = colorElement?.g ?? '0';
        b = colorElement?.b ?? '0';
    }
    
    fillColorPickerForm(form, hex, r, g, b);
}

function listenColorPicker(event) {
    const colorElement = event.target.closest('.color-sample');
    if (!colorElement) return;

    fillColorPickerForm(
        colorElement.closest('form'),
        cssColors[colorElement.dataset.colorIndex].hex,
        cssColors[colorElement.dataset.colorIndex].r,
        cssColors[colorElement.dataset.colorIndex].g,
        cssColors[colorElement.dataset.colorIndex].b
    );
}

function listenColorPickerInput(event) {
    if (!(event.target instanceof HTMLInputElement)) return;
    
    const form = event.target.closest('form');
    const r = parseInt(form.elements['input-color-r'].value).toString(16).padStart(2, '0');
    const g = parseInt(form.elements['input-color-g'].value).toString(16).padStart(2, '0');
    const b = parseInt(form.elements['input-color-b'].value).toString(16).padStart(2, '0');
    
    form.querySelector('.color-indicator').style.backgroundColor = '#' + r + g + b;
}

function listenColorPickerChange(event) {
    if (!(event.target instanceof HTMLInputElement)) return;
    
    const value = parseInt(event.target.value);
    if (!value) {
        event.target.value = '0';
        listenColorPickerInput(event);
    } else if (value > 255) {
        event.target.value = '255';
        listenColorPickerInput(event);
    }
}

function fillColorPickerForm(form, hex, r, g, b) {
    form.elements['input-color-r'].value = r;
    form.elements['input-color-g'].value = g;
    form.elements['input-color-b'].value = b;
    form.querySelector('.color-indicator').style.backgroundColor = hex;
}