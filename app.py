from flask import Flask, request, send_file, after_this_request, jsonify
import os
import uuid
import subprocess
import base64

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create the 'uploads' folder if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def index():
    return send_file('index.html')

@app.route('/convert', methods=['POST'])
def convert():
    data = request.get_json()
    frames = data['frames']

    # Save frames as image files
    frame_paths = []
    for i, frame in enumerate(frames):
        frame_path = os.path.join(app.config['UPLOAD_FOLDER'], f'frame_{i:04d}.jpg')
        with open(frame_path, 'wb') as f:
            f.write(base64.b64decode(frame))
        frame_paths.append(frame_path)

    # Convert frames to video using FFmpeg
    output_filename = str(uuid.uuid4()) + '.mp4'
    output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)

    cmd = ['ffmpeg', '-framerate', '30', '-i', os.path.join(app.config['UPLOAD_FOLDER'], 'frame_%04d.jpg'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', output_path]
    subprocess.run(cmd)

    # Remove frame image files
    for frame_path in frame_paths:
        os.remove(frame_path)

    return output_filename

@app.route('/download/<filename>', methods=['GET'])
def download(filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

    @after_this_request
    def remove_file(response):
        try:
            os.remove(file_path)
        except Exception as error:
            app.logger.error("Error removing or closing downloaded file: %s", error)
        return response

    return send_file(file_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)

