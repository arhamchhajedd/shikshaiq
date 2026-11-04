import os
import glob
import subprocess

FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
OUTPUT_DIR = "/tmp/demo_assembly"
FINAL_PUBLIC_MP4 = "public/shikshaiq_platform_demo.mp4"
FINAL_ROOT_MP4 = "shikshaiq_platform_demo.mp4"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs("public", exist_ok=True)

scenes_metadata = [
    {
        "id": "scene1",
        "video": "/tmp/demo_videos/scene1.webm",
        "audio": "/tmp/demo_audio/scene1_intro.mp3",
        "title": "ShikshaIQ  |  Adaptive Learning Platform for Indian Schools",
    },
    {
        "id": "scene2",
        "video": "/tmp/demo_videos/scene2.webm",
        "audio": "/tmp/demo_audio/scene2_login.mp3",
        "title": "Role-Based Authentication  |  Student, Teacher & Admin Portals",
    },
    {
        "id": "scene3",
        "video": "/tmp/demo_videos/scene3.webm",
        "audio": "/tmp/demo_audio/scene3_student_dashboard.mp3",
        "title": "Student Portal  |  Study Streaks, Offline PWA & Parent Report",
    },
    {
        "id": "scene4",
        "video": "/tmp/demo_videos/scene4.webm",
        "audio": "/tmp/demo_audio/scene4_diagnostic.mp3",
        "title": "Diagnostic Assessment  |  15-Question Prerequisite Knowledge Graph",
    },
    {
        "id": "scene5",
        "video": "/tmp/demo_videos/scene5.webm",
        "audio": "/tmp/demo_audio/scene5_results.mp3",
        "title": "Deterministic Evaluation  |  Root Prerequisite Gap Detection (LCM)",
    },
    {
        "id": "scene6",
        "video": "/tmp/demo_videos/scene6.webm",
        "audio": "/tmp/demo_audio/scene6_lesson.mp3",
        "title": "NCERT Curriculum  |  Interactive Visual Worked Examples & Pitfalls",
    },
    {
        "id": "scene7",
        "video": "/tmp/demo_videos/scene7.webm",
        "audio": "/tmp/demo_audio/scene7_tutor.mp3",
        "title": "Socratic AI Tutor  |  Guided Hints with Indian Cultural Analogies",
    },
    {
        "id": "scene8",
        "video": "/tmp/demo_videos/scene8.webm",
        "audio": "/tmp/demo_audio/scene8_pending_teacher.mp3",
        "title": "Teacher Governance  |  Zero-Trust Verification & Minor Privacy",
    },
    {
        "id": "scene9",
        "video": "/tmp/demo_videos/scene9.webm",
        "audio": "/tmp/demo_audio/scene9_outro.mp3",
        "title": "ShikshaIQ  |  One Classroom. Different Learners. Personalized Learning.",
    },
]

def get_duration(file_path):
    cmd = [
        "ffprobe", "-i", file_path,
        "-show_entries", "format=duration",
        "-v", "quiet",
        "-of", "csv=p=0"
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    try:
        return float(res.stdout.strip())
    except:
        return 0.0

processed_segments = []

for sc in scenes_metadata:
    sc_id = sc["id"]
    in_video = sc["video"]
    in_audio = sc["audio"]
    title = sc["title"].replace(":", "\\:").replace("'", "\\'")

    dur_a = get_duration(in_audio)
    dur_v = get_duration(in_video)

    duration = max(dur_a, dur_v)
    if duration == 0:
        duration = 15.0

    out_mp4 = os.path.join(OUTPUT_DIR, f"{sc_id}_processed.mp4")

    # Filter: drawbox + drawtext
    filter_complex = (
        f"[0:v]scale=1280:720,fps=30,"
        f"drawbox=x=30:y=645:w=1220:h=48:color=black@0.85:t=fill,"
        f"drawtext=fontfile={FONT_PATH}:text='{title}':fontcolor=white:fontsize=18:x=50:y=661[v]"
    )

    cmd = [
        "ffmpeg", "-y",
        "-i", in_video,
        "-i", in_audio,
        "-filter_complex", filter_complex,
        "-map", "[v]",
        "-map", "1:a",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "22",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-t", f"{duration:.2f}",
        out_mp4
    ]

    print(f"Processing {sc_id} (Duration: {duration:.2f}s)...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f"✓ Created {out_mp4}")
        processed_segments.append(out_mp4)
    else:
        print(f"Error processing {sc_id}: {res.stderr}")

# Create concatenation list
concat_list_file = os.path.join(OUTPUT_DIR, "concat_list.txt")
with open(concat_list_file, "w") as f:
    for seg in processed_segments:
        f.write(f"file '{seg}'\n")

print("\nAssembling final video...")
cmd_concat = [
    "ffmpeg", "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concat_list_file,
    "-c", "copy",
    FINAL_PUBLIC_MP4
]
res_concat = subprocess.run(cmd_concat, capture_output=True, text=True)
if res_concat.returncode == 0:
    print(f"✓ Final video generated: {FINAL_PUBLIC_MP4}")
    subprocess.run(["cp", FINAL_PUBLIC_MP4, FINAL_ROOT_MP4])
    print(f"✓ Copied to: {FINAL_ROOT_MP4}")
else:
    print(f"Error assembling video: {res_concat.stderr}")
