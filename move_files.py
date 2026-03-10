import os
import shutil

src = "devflow_app"
dest = "."

for item in os.listdir(src):
    s = os.path.join(src, item)
    d = os.path.join(dest, item)
    if os.path.exists(d):
        if os.path.isdir(d):
            shutil.rmtree(d)
        else:
            os.remove(d)
    shutil.move(s, d)

os.rmdir(src)
print("Moved files successfully")
