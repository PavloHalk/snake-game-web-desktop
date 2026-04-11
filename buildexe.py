import os

command = (
    'pyinstaller --noconsole --onefile '
    '--add-data "snake.html;." '
    '--add-data "snake.css;." '
    '--add-data "app.js;." '
    '--add-data "Maze.js;." '
    '--add-data "Snake.js;." '
    '--add-data "favicon.ico;." '
    '--add-data "pyStorage.js;." '
    '--add-data "forms.js;." '
    '--add-data "csscolors.js;." '
    '--version-file=version.txt '
    '--icon="favicon.ico" '
    'Snake.py'
)

print("🚀 Starting the build process...")
result = os.system(command)

if result == 0:
    print("\n✅ Build successful! Check the 'dist' folder.")
else:
    print("\n❌ Build failed. Check the error messages above.")