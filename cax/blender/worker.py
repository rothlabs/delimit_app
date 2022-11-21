'''
Blender Worker
'''
import sys 
sys.path += ['/home/julian/delimit/cax/blender']
import time
import asyncio, json, threading, traceback 
import bpy
import config, product

async def process_product(reader, writer):
	start_time = time.time()
	data_in = await reader.read(1000000) # 1 Megabyte limit
	data_in = json.loads(data_in.decode())
	data_out = {'success':False}
	try:
		product.build(data_in)
		duration = round((time.time() - start_time)*1000)/1000
		data_out = {'success': True, 'duration': duration} # Add meta data such as price, weight, etc
	except Exception:
		print(traceback.format_exc())
	writer.write(json.dumps(data_out).encode())
	await writer.drain()
	writer.close()

async def main():
    server = await asyncio.start_server(process_product,'127.0.0.1', 8888, reuse_port=True)
    async with server:
        await server.serve_forever()

worker = threading.Thread(target=lambda: asyncio.run(main()), daemon=True)
worker.start()

if bpy.app.background: 
	worker.join()
else: 
	pass
	# Send test to worker thread if GUI enabled (not in background mode)
	#time.sleep(.1)
	#async def cax(data_out):
	#	reader, writer = await asyncio.open_connection('127.0.0.1', 8888) # Connect to FreeCAD Worker
	#	writer.write(json.dumps(data_out).encode())
	#	data_in = await reader.read(1000000) # 1 Megabyte limit
	#	print('CAX Response: '+data_in.decode())
	#	writer.close()
	#asyncio.run(cax({ 
	#	'product_id':  0, 
	#	'drawing':   config.test_drawing, 
	#	}))