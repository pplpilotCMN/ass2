from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/creative')
def creative():
    return render_template('creative.html')

@app.route('/advanced')
def advanced():
    return render_template('advanced.html')

@app.route('/basic')
def basic():
    return render_template('basic.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=81)