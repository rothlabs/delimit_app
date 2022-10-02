'''
FreeCAD Worker
'''
import core # From Delimit
import asyncio, json, threading, traceback # From Python Built-In


product = core.Product('shoe')
sole_xy = product.get('shape/sole/extrude_xy')
sole_yz = product.get('shape/sole/extrude_yz')


async def blender(data_out):
    reader, writer = await asyncio.open_connection('127.0.0.1',7777)
    writer.write(json.dumps(data_out).encode())
    data_in = await reader.read(1000000) # 1 Megabyte limit
    data_in = json.loads(data_in.decode())
    writer.close()
    return data_in


async def update(reader, writer):
    data_in = await reader.read(1000000)  # 1 Megabyte limit
    data_in = json.loads(data_in.decode())

    data_out = {'success': False}
    try: 
        product.svg_base(data_in['sketch_xy'], sole_xy, 'xy', core.v(1,1,1))
        product.svg_base(data_in['sketch_yz'], sole_yz, 'yz', core.v(1,data_in['heel_height'],1))
        product.export(data_in['product_id'])
        data_in = await blender({'product_id': data_in['product_id']}) # Add meta data such as desired detail
        if data_in['success']:
            data_out = {'success': True} # Add meta data such as price, weight, etc
    except Exception:
        print(traceback.format_exc())

    writer.write(json.dumps(data_out).encode())
    await writer.drain()
    writer.close()


async def main():
    server = await asyncio.start_server(update,'127.0.0.1',8888)
    async with server:
        await server.serve_forever()

def run_main():
    asyncio.run(main())

worker = threading.Thread(target=run_main, daemon=True)
worker.start()



#print([o.Label for o in latest])

#with open('/home/julian/delimit/cax/freecad/input/top_sketch.svg', 'w+') as svg_file:
    #    svg_file.write(data['sketch_xy'])
    #    svg_file.close()
    #importSVG.insert('/home/julian/delimit/cax/freecad/input/top_sketch.svg',shoe.doc.Name)

#writer.close() # Is it needed?