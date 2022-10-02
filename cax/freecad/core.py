import FreeCAD as fc # From FreeCAD
import Draft # From FreeCAD
from importSVG import svgHandler # From FreeCAD
import MeshPart, Mesh # From FreeCAD
import xml.sax # From Python Built-In

v = fc.Vector

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

    def delete(self, obj):
        if hasattr(obj,'Objects'): # If it has Objects, it is a clone and the source object must be deleted
            self.doc.removeObject(obj.Objects[0].Name)
        self.doc.removeObject(obj.Name)
    
    def svg_base(self, svg_path, base, target_plane, scale):
        xml.sax.parse(svg_path, self.svg_handler)
        new_base = self.doc.Objects[-1]
        self.delete(base.Base)
        new_base.Visibility = False
        shp = new_base.Shape.copy()
        if target_plane == 'xy':
            shp.rotate(v(0,0,0), v(0,0,1), 90)
        if target_plane == 'yz':
            shp.rotate(v(0,0,0), v(1,1,1), 120)
        new_base.Shape = shp
        new_base_clone = Draft.make_clone(new_base, forcedraft=True)
        new_base_clone.Scale = scale
        base.Base = new_base_clone 
        

    def export(self,product_id):
        self.doc.recompute() # need to check for unexpected zero volume and report failure
        shp = self.shape.Shape.copy()
        shp.rotate(v(0,0,0), v(1,0,0), -90)
        self.mesh.Mesh = MeshPart.meshFromShape(shp, LinearDeflection=0.08, AngularDeflection=0.15, Relative=False)
        self.mesh.recompute()
        Mesh.export([self.mesh],'../tmp/'+str(product_id)+'.obj')

    


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
