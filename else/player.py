# player.py
import math
import wave
import struct
import winsound
import threading
import io
import tempfile
import os

_generation_id = 0
_last_temp_file = None  # 用于记录和清理上一次的临时音频

def midi_to_freq(midi_note):
    return 440.0 * (2.0 ** ((midi_note - 69) / 12.0))

def generate_wav_bytes(history):
    sample_rate = 44100  
    bpm = 65             
    duration_per_chord = 60.0 / bpm
    
    wav_io = io.BytesIO()
    with wave.open(wav_io, 'wb') as wav_file:
        wav_file.setnchannels(1)       
        wav_file.setsampwidth(2)       
        wav_file.setframerate(sample_rate)
        
        chord_audio = bytearray()
        
        for index, item in enumerate(history):
            voices = item["voices"]
            freqs = [midi_to_freq(voices[v]) for v in ['S', 'A', 'T', 'B']]
            
            duration = duration_per_chord * 2.0 if index == len(history) - 1 else duration_per_chord
            num_samples = int(sample_rate * duration)
            
            for i in range(num_samples):
                t = i / sample_rate
                
                env = 1.0
                if i < 400: env = i / 400.0
                elif i > num_samples - 400: env = (num_samples - i) / 400.0
                
                sample = 0.0
                for f in freqs:
                    val = math.sin(2.0 * math.pi * f * t)
                    val += 0.50 * math.sin(2.0 * math.pi * (f * 2) * t)
                    val /= 1.5
                    sample += val * 0.6
                
                master_out = sample / 4.0
                pcm_val = int(master_out * env * 32767.0)
                pcm_val = max(-32768, min(32767, pcm_val))
                
                chord_audio.extend(struct.pack('<h', pcm_val))
                
        wav_file.writeframes(chord_audio)
    return wav_io.getvalue()

def stop_audio():
    global _last_temp_file
    # 1. 强行终止当前正在播放的声音，解除对音频文件的系统锁定
    winsound.PlaySound(None, winsound.SND_PURGE)
    
    # 2. 静悄悄地把上一个临时音频文件删掉，保持硬盘干净
    if _last_temp_file and os.path.exists(_last_temp_file):
        try:
            os.remove(_last_temp_file)
        except Exception:
            pass

def play_history(history, on_play_start=None):
    global _generation_id, _last_temp_file
    stop_audio()
    _generation_id += 1
    current_id = _generation_id
    
    def _generate_and_play():
        global _last_temp_file
        wav_bytes = generate_wav_bytes(history)
        
        if current_id != _generation_id: return
        
        # 🌟 核心修复：将内存波形瞬间写入系统级临时文件
        fd, tmp_path = tempfile.mkstemp(suffix='.wav')
        with os.fdopen(fd, 'wb') as f:
            f.write(wav_bytes)
            
        _last_temp_file = tmp_path
        
        if on_play_start:
            on_play_start()
            
        # 🌟 绕开系统限制，使用 SND_FILENAME | SND_ASYNC 完美实现异步秒切！
        winsound.PlaySound(tmp_path, winsound.SND_FILENAME | winsound.SND_NODEFAULT | winsound.SND_ASYNC)
        
    threading.Thread(target=_generate_and_play, daemon=True).start()