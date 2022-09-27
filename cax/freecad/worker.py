'''
FreeCAD Worker
'''

import core # Delimit
import asyncio, json, threading, xml.sax, traceback # Python Built-In
from importSVG import svgHandler # FreeCAD

product = core.Template('shoe')
insole_xy = product.select('insole/common/extrude_xy')
insole_yz = product.select('insole/common/extrude_yz')

async def update(reader, writer):
    data = await reader.read()
    data = json.loads(data.decode())
    handler = svgHandler()
    handler.doc = product.doc
    xml.sax.parseString(data['sketch_xy'],handler)
    latest = product.latest()
    #print([o.Label for o in latest])
    latest[0].Visibility = False
    insole_xy.Base = latest[0]
    product.doc.recompute()

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


#with open('/home/julian/delimit/cax/freecad/input/top_sketch.svg', 'w+') as svg_file:
    #    svg_file.write(data['sketch_xy'])
    #    svg_file.close()
    #importSVG.insert('/home/julian/delimit/cax/freecad/input/top_sketch.svg',shoe.doc.Name)

#writer.close() # Is it needed?