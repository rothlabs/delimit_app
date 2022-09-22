'''
FreeCAD Example
Make the insole an ellipse from top view.
'''

import core

shoe = core.Template('shoe')

ellipse = Part.Ellipse()
ellipse.MajorRadius = 150 # mm
ellipse.MinorRadius = 50 # mm
ellipse.rotate(core.rotate((0,0,1), 90))

sketch = shoe.select('insole/common/extrude_xy/sketch_xy')
sketch.deleteAllGeometry()
sketch.addGeometry(ellipse)

shoe.doc.recompute()

print('wow, much freecad')
