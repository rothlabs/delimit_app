'''
FreeCAD Worker
'''
import sys, time, asyncio, json, threading, traceback
from subprocess import Popen, PIPE
import FreeCADGui
import config, product 

async def blender(data_out):
    process = Popen(['blender', '-b', '-P', '../blender/worker.py', '--', str(data_out['product_id'])], stdout=PIPE, stderr=PIPE)
    stdout, stderr = process.communicate()
    print(str(stdout))
    if "{'success': True" in str(stdout): return True
    return False

async def process_product(reader, writer):
    start_time = time.time()
    data_in = await reader.read(1000000)  # 1 Megabyte limit
    data_in = json.loads(data_in.decode())
    data_out = {'success': False}
    try: 
        product.build(data_in)
        blender_response = {'success':True}
        blender_response = await blender(data_in) # Add meta data such as desired detail
        if blender_response:
            duration = round((time.time() - start_time)*1000)/1000
            data_out = {'success': True, 'duration': duration} # Add meta data such as price, weight, etc
    except Exception:
        print(traceback.format_exc())
    writer.write(json.dumps(data_out).encode())
    await writer.drain()
    writer.close()

async def main():
    server = await asyncio.start_server(process_product,'127.0.0.1',7777, reuse_port=True)
    async with server:
        await server.serve_forever()

threading.Thread(target=lambda: asyncio.run(main()), daemon=True).start()

## Test worker by sending request if specified
if sys.argv[-1] == 'test': 
    async def cax(data_out):
        reader, writer = await asyncio.open_connection('127.0.0.1', 7777) # Connect to FreeCAD Worker
        writer.write(json.dumps(data_out).encode())
        data_in = await reader.read(1000000) # 1 Megabyte limit
        print('CAX Response: '+data_in.decode())
        writer.close()
    asyncio.run(cax({ # send product id, sketches, and more to cax
            'product_id':  0, 
            'drawing':   config.test_drawing, 
        }))

if not hasattr(FreeCADGui,'addCommand'):
    exit()
