import FreeCAD as fc

def vect(v):
    return fc.Vector(v[0],v[1],v[2])
    

class Template:
    
    def __init__(self, name):
        self.doc = fc.openDocument('templates/'+name+'.FCStd') 
        
    def select(self, path):
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


# https://forum.freecadweb.org/viewtopic.php?t=16110
def rotate(axis, angle):
    axis = vect(axis)
    origin = fc.Vector(0,0,0)
    local_cs = fc.Placement(origin, fc.Rotation(fc.Vector(0,0,1), axis))
    return local_cs.multiply(fc.Placement(fc.Vector(),fc.Rotation(angle,0,0)).multiply(local_cs.inverse()))
