import bpy 
import config
from . import load, surf, mod

def build(args):

    # delete 
    for obj in bpy.data.objects: bpy.data.objects.remove(obj, do_unlink=True)

    # import 
    sole, upper, tongue = load.meshes(args['product_id'])

    # sole
    #mod.remesh(sole)

    # upper
    #mod.solidify(upper)

    # tongue
    #mod.solidify(tongue)
    #mod.remesh(tongue)
    #mod.decimate(tongue)
    #mod.edge_split(tongue)
    mod.unwrap(tongue) 

    # material and uv
    #sole.data.materials.append(surf.material('diffuse', .2, .2, 1))
    #surf.random_uv(sole.data)

    # export
    #bpy.ops.export_scene.gltf(filepath='../tmp/'+str(args['product_id'])+'_sole.glb')




# works for imported .obj file:
# fix normals (warning: edge split disconnets faces)
#sole.data.use_auto_smooth = False
#edge_split = sole.modifiers.new(name='edge_split', type='EDGE_SPLIT')
#edge_split.use_edge_sharp = False
#bpy.ops.object.modifier_apply({"object":sole}, modifier=edge_split.name) 