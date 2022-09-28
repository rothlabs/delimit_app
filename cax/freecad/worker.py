'''
FreeCAD Worker
'''

import core # From Delimit
import asyncio, json, threading, traceback # From Python Built-In

product = core.Product('shoe')
sole_xy = product.get('shape/sole/extrude_xy')
sole_yz = product.get('shape/sole/extrude_yz')

async def update(reader, writer):
    data = await reader.read()
    data = json.loads(data.decode())
    product.svg_base(data['sketch_xy'], sole_xy)
    #product.svg_base(data['sketch_yz'], sole_yz)
    product.export()

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