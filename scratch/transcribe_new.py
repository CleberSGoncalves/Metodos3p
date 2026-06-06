import speech_recognition as sr
import os

r = sr.Recognizer()
audio_dir = "E:\\desenvolvimento\\Reformasemerro\\audios\\audio_novo\\new"

files = ["audio_new_1.wav", "audio_new_2.wav"]

for f in files:
    path = os.path.join(audio_dir, f)
    print(f"Transcribing {f}...")
    try:
        with sr.AudioFile(path) as source:
            audio = r.record(source)
            text = r.recognize_google(audio, language='pt-BR')
            print(f"RESULT {f}: {text}")
    except Exception as e:
        print(f"Error {f}: {e}")
