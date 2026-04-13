export default class Food {
    static #lastId = 0;
    
    #id = -1;
    #timer = 50;
    #el = null;
    
    constructor(timer = 50) {
        this.#id = Food.#lastId++;
        
        this.#timer = timer;
        this.#el = document.createElement('div');
        this.#el.className = 'food';
        this.#el.dataset.foodId = this.#id.toString();
    }
    
    getId() {
        return this.#id;
    }
    
    getElement() {
        return this.#el;
    }
    
    rot() {
        this.#timer--;
        
        if (this.#timer < 0) {
            this.#el.remove();
            return true;
        }
        
        return false;
    }
}