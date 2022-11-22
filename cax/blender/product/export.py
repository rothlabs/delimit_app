import bpy

def glb(product_id):
    bpy.ops.object.mode_set(mode = 'OBJECT')
    for i, part_name in enumerate(['sole', 'upper', 'tongue']):
        bpy.ops.export_scene.gltf(filepath='../tmp/'+str(product_id)+'_'+part_name+'.glb')