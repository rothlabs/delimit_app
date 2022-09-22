import FreeCAD

class Template:
    
    def __init__(self, name):
        self.doc = FreeCAD.openDocument('templates/'+name+'.FCStd') 
        
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
                
