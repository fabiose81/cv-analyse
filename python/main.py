import os
import json
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), './aws/'))

from flask import Flask, request, jsonify
from flask_cors import CORS 
import s3

app = Flask(__name__)

UPLOAD_FOLDER = '../uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

CRITERIA_FILE = "criteria.txt"

CORS(app)
port = int(os.environ.get('PORT', 5000))

@app.route("/job", methods=['POST'])
def opportunity():
    try:
        title = request.get_json()["title"]
        criteria = request.get_json()["criteria"]
      
        criteria_file = os.path.join(app.config["UPLOAD_FOLDER"], CRITERIA_FILE)
        with open(criteria_file, 'w') as file:
            file.write(criteria)
        
        result, error = s3.create_bucket(title, CRITERIA_FILE, app.config["UPLOAD_FOLDER"]) 
        if not error:
            os.remove(criteria_file)
            return result    
        else:
            return error     
   
    except Exception as e:
        return str(e)
            
@app.route("/jobs", methods=['GET'])
def list():
   return s3.list()

@app.route("/upload", methods=["POST"])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': "No file part"}), 400
    
    try:        
        file = request.files["file"]
        bucket = json.loads(request.form.get('data'))["bucket"]
        if file:
            cv_file_name = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
            file.save(cv_file_name)
            print("Saving cv file...")
            
            result_upload, error_upload = s3.upload(bucket, app.config["UPLOAD_FOLDER"], file.filename)
            if not error_upload:
                os.remove(cv_file_name)
                print("Deleting cv file...")
                return result_upload
            else:
                return str(error_upload)
                
    except Exception as e:
        return str(e)
    
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=port)