import config
import asyncio, json

async def cax(data_out):
    reader, writer = await asyncio.open_connection('127.0.0.1', 8888) # Connect to FreeCAD Worker
    writer.write(json.dumps(data_out).encode())
    data_in = await reader.read(1000000) # 1 Megabyte limit
    print('CAX Response: '+data_in.decode())
    writer.close()
asyncio.run(cax({ # send product id, sketches, and more to cax
        'product_id':  1, 
        'sketch':   config.test_drawing, 
        #'insole':   config.test_insole, 
    }))
