'''
FreeCAD Worker
'''

import core

shoe = core.Template('shoe')

sketch = shoe.select('insole/common/extrude_yz/sketch_yz')

# insert svg geometry into sketch
shoe.doc.recompute()

