# /usr/bin/env python
# -*- coding=utf-8 -*-

from time import sleep
from os import system

i = 1
while i:
    try:
        system("python /data/app.py &")
        i = 0
    except FileNotFoundError:
        continue
    sleep(5)
