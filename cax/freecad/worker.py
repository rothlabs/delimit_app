'''
FreeCAD Worker
'''
import time, asyncio, json, threading, traceback 
import FreeCADGui
import product, config 

async def blender(data_out):
    reader, writer = await asyncio.open_connection('127.0.0.1',7777)
    writer.write(json.dumps(data_out).encode())
    data_in = await reader.read(1000000) # 1 Megabyte limit
    data_in = json.loads(data_in.decode())
    writer.close()
    return data_in

async def process_drawing(reader, writer):
    start_time = time.time()
    data_in = await reader.read(1000000)  # 1 Megabyte limit
    data_in = json.loads(data_in.decode())
    data_out = {'success': False}
    try: 
        product.build(data_in)
        #product.export(data_in['product_id'])
        #data_in = await blender({'product_id': data_in['product_id']}) # Add meta data such as desired detail
        #if data_in['success']:
        duration = round((time.time() - start_time)*1000)/1000
        data_out = {'success': True, 'duration': duration} # Add meta data such as price, weight, etc
    except Exception:
        print(traceback.format_exc())
    writer.write(json.dumps(data_out).encode())
    await writer.drain()
    writer.close()

async def main():
    server = await asyncio.start_server(process_drawing,'127.0.0.1',8888, reuse_port=True)
    async with server:
        await server.serve_forever()

threading.Thread(target=lambda: asyncio.run(main()), daemon=True).start()

# Send test drawing to worker thread if GUI enabled (not in console mode)
if hasattr(FreeCADGui,'addCommand'): 
    async def cax(data_out):
        reader, writer = await asyncio.open_connection('127.0.0.1', 8888) # Connect to FreeCAD Worker
        writer.write(json.dumps(data_out).encode())
        data_in = await reader.read(1000000) # 1 Megabyte limit
        print('CAX Response: '+data_in.decode())
        writer.close()
    asyncio.run(cax({ # send product id, sketches, and more to cax
            'id':  0, 
            'drawing':   config.test_drawing, 
        }))
