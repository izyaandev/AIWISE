from PIL import Image

def remove_white_background(img_path):
    img = Image.open(img_path)
    img = img.convert("RGBA")
    
    data = img.getdata()
    new_data = []
    
    for item in data:
        # Change all white (also shades of whites)
        # to transparent
        if item[0] > 200 and item[1] > 200 and item[2] > 200:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(img_path, "PNG")

if __name__ == "__main__":
    remove_white_background("D:/Desktop/AIWISE/public/new_logo.png")
