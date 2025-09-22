from flask import Flask, jsonify, request
from flask_cors import CORS
from dbModels import db, User, Course, Assignment
from flask_bcrypt import Bcrypt
import os
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime


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

### USER AUTHENTICATION ENDPOINTS ###
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


#user logs in - accessing existing account and create JWT access token
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
    
    access_token = create_access_token(identity=str(existing_user.id))

    return jsonify({
        "access_token": access_token, 
        "username": existing_user.username}), 200


### COURSES ENDPOINTS ###
#get all courses for the user
@app.route("/courses", methods=["GET"])
@jwt_required()
def get_courses():
    current_user_id = int(get_jwt_identity())
    user = User.query.filter_by(id=current_user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    #get courses for the user
    courses = Course.query.filter_by(user_id=user.id).all()
    courses_list = []
    for course in courses:
        courses_list.append({
            "id": course.id,
            "name": course.name,
            "start_date": str(course.start_date),
            "end_date": str(course.end_date),
        })

    return jsonify(courses_list), 200


#create a course
@app.route("/addcourse", methods=["POST"])
@jwt_required()
def add_course():
    data = request.get_json()
    name = data.get("name")
    start_date = data.get("start_date")
    end_date = data.get("end_date")

    if not name or not start_date or not end_date:
        return jsonify({"error": "All fields are required"}), 400

    #convert to datetime objects to store properly in DB
    try:
        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
        end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400
    
    #get the user's id from the JWT token
    current_user_id = int(get_jwt_identity())
    user = User.query.filter_by(id=current_user_id).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    #save to DB
    new_course = Course(
        name=name,
        start_date=start_date_obj,
        end_date=end_date_obj,
        user_id=user.id,
    )

    db.session.add(new_course)
    db.session.commit()

    return jsonify({
        "id": new_course.id,
        "name": new_course.name,
        "start_date": str(new_course.start_date),
        "end_date": str(new_course.end_date),
    }), 201


#edit an existing course
@app.route("/editcourse/<int:course_id>", methods=["PUT"])
@jwt_required()
def edit_course(course_id):
    current_user_id = int(get_jwt_identity())
    course = Course.query.filter_by(id=course_id, user_id=current_user_id).first()

    #check if course exists and belongs to the user
    if not course:
        return jsonify({"error": "Course not found"}), 404

    data = request.get_json()
    name = data.get("name")
    start_date = data.get("start_date")
    end_date = data.get("end_date")

    if not name or not start_date or not end_date:
        return jsonify({"error": "All fields are required"}), 400

    #convert to datetime objects to store properly in DB
    try:
        course.start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        course.end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
        course.name = name
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    #save changes to DB
    db.session.commit()

    return jsonify({"message": "Course updated successfully"}), 200


#delete a course
@app.route("/deletecourse/<int:course_id>", methods=["DELETE"])
@jwt_required()
def delete_course(course_id):
    current_user_id = int(get_jwt_identity())
    course = Course.query.filter_by(id=course_id, user_id=current_user_id).first()

    #check if course exists and belongs to the user
    if not course:
        return jsonify({"error": "Course not found"}), 404

    #delete the course from DB
    db.session.delete(course)
    db.session.commit()

    return jsonify({"message": "Course deleted successfully"}), 200


if __name__ == '__main__':
    app.run(debug=True)