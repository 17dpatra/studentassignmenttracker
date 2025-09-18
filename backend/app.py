from flask import Flask, jsonify, request
from flask_cors import CORS
from dbModels import db, User
from flask_bycrypt import Bcrypt

app = Flask(__name__)
CORS(app)


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///student_assignment_tracker.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()


#user registering - creating account for the first time
@app.route("/register", methods=["POST"])
def register():
    username = request.json("username")
    password = request.json("password")

    #check if user already exists in DB. if it does - error
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"error": "User already exists"}), 400
    
    #before adding user to db, hash the password
    hashed_pass = Bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password=hashed_pass)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "id": "1",
        "username": username
        })


#user logs in - accessing existing account
@app.route("/login", methods=["POST"])
def login():
    username = request.json("username")
    password = request.json("password")

    #check if user exists in DB - if it doesn't - error
    existing_user = User.query.filter_by(username=username).first()
    if not existing_user:
        return jsonify({"error": "User does not exist"}), 400
    
    #check if password matches
    if not Bcrypt.check_password_hash(existing_user.password, password):
        return jsonify({"error": "Incorrect password"}), 400

    return jsonify({
        "id": existing_user.id,
        "username": existing_user.username
        })


if __name__ == '__main__':
    app.run(debug=True)