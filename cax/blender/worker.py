'''
Blender Worker
'''
import sys 
sys.path += ['/home/julian/delimit/cax/blender']
import time
import asyncio, json, threading, traceback 
import bpy
import config, product

argv = sys.argv[sys.argv.index("--") + 1:] # get all args after "--"

start_time = time.time()
data_out = {'success':False}
try:
    product.build(argv[0])
    duration = round((time.time() - start_time)*1000)/1000
    data_out = {'success': True, 'duration': duration} # Add meta data such as price, weight, etc
except Exception:
    print(traceback.format_exc())

print('-------------------------------')
print(data_out) # must send data back to freecad worker
print('-------------------------------')