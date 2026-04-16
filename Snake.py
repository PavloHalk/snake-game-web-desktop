import webview
import os
import sys
import json

class Api:
    def save_data(self, data_json):
        with open("snakedata.json", "w") as f:
            f.write(data_json)
        return "Збережено!"

    def load_data(self):
        if os.path.exists("snakedata.json"):
            with open("snakedata.json", "r") as f:
                return f.read()
        return "{}"

# Correct getting file paths (important for exe)
def get_resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

api = Api()

html_file = get_resource_path('snake.html')

window = webview.create_window(
    'Snake',
    html_file,
    width=1000,
    height=700,
    js_api=api
)

webview.start(http_server=True, debug=False, user_agent='pywebview-client')

# Compilation to exe: see ./buildexe.py