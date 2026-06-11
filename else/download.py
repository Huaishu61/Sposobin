import urllib.request
import os

# 需要下载的音符列表
notes = ["C2", "Ds2", "Fs2", "A2", "C3", "Ds3", "Fs3", "A3", 
         "C4", "Ds4", "Fs4", "A4", "C5", "Ds5", "Fs5", "A5", "C6"]

base_url = "https://tonejs.github.io/audio/salamander/"
folder_name = "salamander"

# 创建文件夹
os.makedirs(folder_name, exist_ok=True)

print("开始下载大钢琴采样文件...")
for note in notes:
    file_name = f"{note}.mp3"
    url = base_url + file_name
    save_path = os.path.join(folder_name, file_name)
    print(f"正在下载: {file_name} ...")
    try:
        urllib.request.urlretrieve(url, save_path)
    except Exception as e:
        print(f"❌ 下载失败 {file_name}: {e}")

print("✅ 所有文件下载完毕！")