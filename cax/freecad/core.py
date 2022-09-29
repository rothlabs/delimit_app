import FreeCAD as fc # From FreeCAD
from importSVG import svgHandler # From FreeCAD
import MeshPart, Mesh # From FreeCAD
import xml.sax # From Python Built-In

class Product:
    
    def __init__(self, name):
        self.doc = fc.openDocument('templates/'+name+'.FCStd') 
        self.mesh = self.get('mesh')
        self.shape = self.get('shape')
        self.svg_handler = svgHandler()
        self.svg_handler.doc = self.doc
        
    def get(self, path):
        path = path.split('/')
        def search(objects):
            for obj in objects:
                if obj.Label == path[0]:
                    if len(path) > 1:
                        path.pop(0)
                        return search(obj.OutList)
                    else: 
                        return obj
        return search(self.doc.RootObjects)
    
    def svg_base(self, svg, base):
        xml.sax.parseString(svg, self.svg_handler)
        self.doc.removeObject(base.Base.Name)
        base.Base = self.doc.Objects[-1]
        self.doc.Objects[-1].Visibility = False

    def export(self):
        self.doc.recompute()
        self.mesh.Mesh = MeshPart.meshFromShape(self.shape.Shape, LinearDeflection=0.08, AngularDeflection=0.15, Relative=False)
        self.mesh.recompute()
        Mesh.export([self.mesh],'../tmp/product.obj')


#def latest(self):
#        latest_objects = list(set(self.doc.Objects) - set(self.objects))
#        self.objects = self.doc.Objects
#        return latest_objects

#def vect(v):
#    return fc.Vector(v[0],v[1],v[2])

# https://forum.freecadweb.org/viewtopic.php?t=16110
#def rotate(axis, angle):
#    axis = vect(axis)
#    origin = fc.Vector(0,0,0)
#    local_cs = fc.Placement(origin, fc.Rotation(fc.Vector(0,0,1), axis))
#    return local_cs.multiply(fc.Placement(fc.Vector(),fc.Rotation(angle,0,0)).multiply(local_cs.inverse()))
