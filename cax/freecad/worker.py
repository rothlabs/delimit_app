'''
FreeCAD Worker
'''

import core

doc = core.Template('shoe')

obj = doc.select('insole/common/extrude_yz')

print(obj.Label)
