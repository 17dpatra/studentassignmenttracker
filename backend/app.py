from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/register", methods=["POST"])
def register():
    username = request.json("username")
    password = request.json("password")
    return jsonify({
        "id": "1",
        "username": username
        })

if __name__ == '__main__':
    app.run(debug=True)