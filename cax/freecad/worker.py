'''
FreeCAD Worker
'''

import core # From Delimit
import asyncio, json, threading, traceback # From Python Built-In

product = core.Product('shoe')
sole_xy = product.get('shape/sole/extrude_xy')
sole_yz = product.get('shape/sole/extrude_yz')

state = {'success':False}

async def blender(data_out):
    reader, writer = await asyncio.open_connection('127.0.0.1',7777)
    writer.write(data_out.encode())
    writer.close()

    data_in = await reader.read()
    #data_in = json.loads(data_in.decode())
    return data_in
    #await writer.drain()
    

async def update(reader, writer):
    data_in = await reader.read()

    data_in = json.loads(data_in.decode())
    product.svg_base(data_in['sketch_xy'], sole_xy)
    #product.svg_base(data['sketch_yz'], sole_yz)
    product.export()

    ##data_out = json.dumps({'success': True}).encode()
    ##print('\nDATA OUT: '+ data_out+'\n')
    ##writer.write(data_out)
    ##writer.close()
    #await writer.drain()

    blender_result = await blender(json.dumps({'update_product': True}))
    print(blender_result)
    writer.write(blender_result)
    writer.close()
    #data_out = {'success': blender_result['success']}
    #writer.write(json.dumps(data_out).encode())
    #writer.close()
    #await writer.drain()


async def main():
    server = await asyncio.start_server(update,'127.0.0.1',8888)
    async with server:
        await server.serve_forever()

def run_main():
    asyncio.run(main())

try:
    worker = threading.Thread(target=run_main, daemon=True)
    worker.start()
except Exception:
    print(traceback.format_exc())



#print([o.Label for o in latest])

#with open('/home/julian/delimit/cax/freecad/input/top_sketch.svg', 'w+') as svg_file:
    #    svg_file.write(data['sketch_xy'])
    #    svg_file.close()
    #importSVG.insert('/home/julian/delimit/cax/freecad/input/top_sketch.svg',shoe.doc.Name)

#writer.close() # Is it needed?