#!/usr/bin/env python
import base64
import requests
import json
from PIL import Image
import os

# This python script captures your main screen and sends
# it to imgbb to create a link that gets destroyed every 1 minute.
# The link is then forwarded to your slack hook
# ***** WARNING! IMGBB API KEY EXPIRES, I DON'T KNOW WHEN THOUGH ******

os.system("screencapture imgbb.png")


def snip_snap(imgbb_key, slack_hook_url):
    img = Image.open('./imgbb.png')
    path_compressed = './imgbb_compressed.png'
    img = img.resize((1020, 720))
    img.save(path_compressed, optimize=True, quality=95)

    with open("./imgbb_compressed.png", "rb") as file:
        payload = {
            "expiration": 60,
            "key": imgbb_key,
            "image": base64.b64encode(file.read()),
        }
        imgbb_response = requests.post("https://api.imgbb.com/1/upload", payload)
        imgbb_url = imgbb_response.json()['data']['url']

        payload = {"text": imgbb_url}
        requests.post(slack_hook_url,
                      json.dumps(payload))


snip_snap('', "") # PLACE YOU IMGBB KEY HERE, AND YOUR SLACK HOOK
