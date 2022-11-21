import config
import FreeCAD, Mesh
from . import make

def meshes(product_id, parts):
    for i, part_name in enumerate(['sole', 'upper', 'tongue']):
        mesh = make.mesh(parts[i])
        Mesh.export([mesh],'../tmp/'+str(product_id)+'_'+part_name+'.stl')