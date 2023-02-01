import sys 
sys.path += ['/home/julian/delimit/cax/blender']
import time
import asyncio, json, threading, traceback 
import bpy
import config, product

argv = sys.argv[sys.argv.index("--") + 1:] # get all args after "--"

print('argv: '+str(argv))

print('cax_done')