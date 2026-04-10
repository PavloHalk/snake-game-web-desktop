# My Snake Game

This is the classic snake game, made for fun and for training purposes.
Works as a web page with the ability to be compiled into a Windows executable
file!

### Technologies

- **HTML/CSS** (Layout)
- **Javascript** (Logic)
- **Python** (Compilation to an executable file)

### How to run

#### As web page

1. Create a directory for a project and set up a web server for it (JavaScript will not work if you just open `index.html` as a file because ES modules are used).
2. Go inside directory and clone repository: `git clone https://github.com/PavloHalk/snake-game-web-desktop`
3. Open the page you set up on step 1 in your browser.
4. Enjoy.

#### As windows executable file

Download the latest release and run `Snake.exe`

Or:

1. Install Python3 if you don't have it.
2. Install `pywebview` and `pyinstaller` if you don't have it: `pip install pywebview pyinstaller`
3. Create a directory for a project.
4. Go inside directory and clone repository: `git clone https://github.com/PavloHalk/snake-game-web-desktop`
5. run `py buildexe.py`
6. Open built `Snake.exe` inside `dist` directory.
7. Enjoy.

### Why it was created

The idea of this project hit my head when I was reviewing what I 
learned a long time ago about programming in JavaScript. The purpose was to
remember how to work with DOM, and I'd like to create something for my kids.

P.S. They were happy to play dad's snake.