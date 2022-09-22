'''
FreeCAD Worker
'''

import core

shoe = core.Template('shoe')

insole_sketch_yz = shoe.select('insole/common/extrude_yz/sketch_yz')

# insert svg geometry into insole_sketch_yz
shoe.doc.recompute()

