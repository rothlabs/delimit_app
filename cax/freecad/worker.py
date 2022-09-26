'''
FreeCAD Worker
'''

import core # Delimit
import asyncio, json, threading, xml.sax, traceback # Python Built-In
from importSVG import svgHandler # FreeCAD

shoe = core.Template('shoe')
insole_sketch_xy = shoe.select('insole/common/extrude_xy/sketch_xy')
insole_sketch_yz = shoe.select('insole/common/extrude_yz/sketch_yz')

async def update(reader, writer):
    data = await reader.read()
    data = json.loads(data.decode())
    handler = svgHandler()
    handler.doc = shoe.doc
    xml.sax.parseString(data['sketch_xy'],handler)
    shoe.doc.recompute()

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