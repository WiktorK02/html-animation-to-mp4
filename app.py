
from flask import Flask, request, send_file
import os
import uuid
import subprocess

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
@app.route('/')
def index():
    return send_file('index.html')
@app.route('/upload', methods=['POST'])
def upload():
    if 'video' not in request.files:
        return "No video file uploaded", 400
    
    video_file = request.files['video']
    
    if video_file.filename == '':
        return "No selected file", 400
    
    if video_file:
        filename = str(uuid.uuid4()) + '.webm'
        video_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        video_file.save(video_path)
        
        output_filename = filename.replace('.webm', '.mp4')
        output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
        
        # Convert the webm video to mp4 using ffmpeg
        cmd = ['ffmpeg', '-i', video_path, output_path]
        subprocess.run(cmd)
        
        return output_filename

@app.route('/download/<filename>', methods=['GET'])
def download(filename):
    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], filename), as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
