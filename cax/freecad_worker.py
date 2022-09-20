'''
FreeCAD Worker
'''

import config

def FreeCAD_Document(name):
    return FreeCAD.openDocument(config.wd + name +'.FCStd')

doc = FreeCAD_Document('insole')

f = doc.addObject('Part::Extrusion','Extrude')
f.Base = doc.getObjectsByLabel('sketch')[0]
f.DirMode = "Normal"
f.DirLink = None
f.LengthFwd = 10.0
f.LengthRev = 0.0
f.Solid = True
f.Reversed = False
f.Symmetric = False
f.TaperAngle = 0.0
f.TaperAngleRev = 0.0

doc.recompute()
