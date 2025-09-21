from flask import Flask, jsonify, request
from flask_cors import CORS
from dbModels import db, User
from flask_bcrypt import Bcrypt
import os
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity


load_dotenv() #loads env variables from the .env file (added in .gitignore)

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///student_assignment_tracker.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "fallback-secret")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-jwt")  


db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()


#user registering - creating account for the first time
@app.route("/register", methods=["POST"])
def register():
    username = request.json.get("username")
    password = request.json.get("password")

    #check if user already exists in DB. if it does - error
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"error": "User already exists"}), 400
    
    #before adding user to db, hash the password
    hashed_pass = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password=hashed_pass)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "id": "1",
        "username": username
        }), 200


#user logs in - accessing existing account
@app.route("/login", methods=["POST"])
def login():
    username = request.json.get("username")
    password = request.json.get("password")

    #check if user exists in DB - if it doesn't - error
    existing_user = User.query.filter_by(username=username).first()
    if not existing_user:
        return jsonify({"error": "User does not exist"}), 401
    
    #check if password matches
    if not bcrypt.check_password_hash(existing_user.password, password):
        return jsonify({"error": "Incorrect password"}), 401
    
    access_token = create_access_token(identity=existing_user.id)

    return jsonify({
        "access_token": access_token, 
        "username": existing_user.username}), 200


@app.route("/courses", methods=["GET"])
@jwt_required()
def get_courses():
    user_id = get_jwt_identity()
    return jsonify({
        "message": f"Here are courses for user {user_id}",
        "courses": ["Math", "Science", "History"]
    })

if __name__ == '__main__':
    app.run(debug=True)