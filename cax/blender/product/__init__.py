import bpy 
import config
from . import load, make, mod, gui#, export

def build(product_id):

    # delete 
    for obj in bpy.data.objects: bpy.data.objects.remove(obj, do_unlink=True)

    # import 
    sole, tongue, upper = load.meshes(product_id)

    # sole
    #mod.remesh(sole)
    #mod.decimate(sole)
    #mod.edge_split(sole)

    # fabric
    #for obj in [upper]:
        #mod.solidify(obj)
        #mod.remesh(obj)
        #mod.decimate(obj)
        #mod.edge_split(obj)

    #mod.edit_mode(obj)
    bpy.ops.object.add(radius=1.0, type='MESH', enter_editmode=True)
    bpy.ops.mesh.primitive_cube_add(size=1.0, calc_uvs=False, enter_editmode=False, location=(0.0, 100.0, 0.0), scale=(0.1, 200.0, 200.0))
    mod.solidify(upper)
    mod.remesh(upper)
    mod.decimate(upper)
    mod.boolean(upper, cut=bpy.data.objects[-1])
    mod.edge_split(upper)
    mod.unwrap(upper)
    bpy.data.objects.remove(bpy.data.objects[-1], do_unlink=True)


    # all
    for obj in [sole, upper, tongue]:
        #mod.unwrap(obj)
        #bpy.ops.object.mode_set(mode = 'OBJECT')
        mod.edit_mode(obj)
        mat = make.material('diffuse', .2, .2, 1)
        if len(obj.data.materials) > 0: obj.data.materials[0] = mat
        else: obj.data.materials.append(mat)

    # export
    bpy.ops.object.mode_set(mode = 'OBJECT')
    bpy.ops.export_scene.gltf(filepath='../tmp/'+str(product_id)+'_shoe.glb')

    gui.show_material()

