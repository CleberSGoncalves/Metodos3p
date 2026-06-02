import speech_recognition as sr
r = sr.Recognizer()
try:
    with sr.AudioFile('E:\\desenvolvimento\\Reformasemerro\\audios\\audio_novo\\audio1.wav') as source:
        audio = r.record(source)
        print('AUDIO 1:', r.recognize_google(audio, language='pt-BR'))
except Exception as e:
    print('Error AUDIO 1:', e)

try:
    with sr.AudioFile('E:\\desenvolvimento\\Reformasemerro\\audios\\audio_novo\\audio2.wav') as source:
        audio = r.record(source)
        print('AUDIO 2:', r.recognize_google(audio, language='pt-BR'))
except Exception as e:
    print('Error AUDIO 2:', e)
