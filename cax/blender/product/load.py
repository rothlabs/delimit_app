import bpy

def meshes(product_id):
    for i, part_name in enumerate(['sole', 'upper', 'tongue']):
        bpy.ops.import_mesh.stl(filepath='../tmp/'+str(product_id)+'_'+part_name+'.stl')
    return bpy.data.objects[0], bpy.data.objects[1], bpy.data.objects[2]

#bpy.ops.import_scene.obj(filepath='../tmp/'+str(product_id)+'_'+part_name+'.obj')