'''
Blender Worker
'''
import bpy
import asyncio, json, threading, traceback


for obj in bpy.data.objects:
	bpy.data.objects.remove(obj, do_unlink=True)


def new_material(id):
    mat = bpy.data.materials.get(id)
    if mat is None:
        mat = bpy.data.materials.new(name=id)
    mat.use_nodes = True
    if mat.node_tree:
        mat.node_tree.links.clear()
        mat.node_tree.nodes.clear()
    return mat

def new_shader(id, type, r, g, b):
	mat = new_material(id)
	nodes = mat.node_tree.nodes
	links = mat.node_tree.links
	output = nodes.new(type='ShaderNodeOutputMaterial')
	if type == "diffuse":
		shader = nodes.new(type='ShaderNodeBsdfPrincipled')
		#print(nodes[1])
		nodes["Principled BSDF"].inputs[0].default_value = (r, g, b, 1)
	elif type == "emission":
		shader = nodes.new(type='ShaderNodeEmission')
		nodes["Emission"].inputs[0].default_value = (r, g, b, 1)
		nodes["Emission"].inputs[1].default_value = 1
	elif type == "glossy":
		shader = nodes.new(type='ShaderNodeBsdfGlossy')
		nodes["Glossy BSDF"].inputs[0].default_value = (r, g, b, 1)
		nodes["Glossy BSDF"].inputs[1].default_value = 0
	links.new(shader.outputs[0], output.inputs[0])
	return mat


async def update(reader, writer):
	data_in = await reader.read(1000000) # 1 Megabyte limit
	data_in = json.loads(data_in.decode())

	data_out = {'success':False}
	try:
		bpy.ops.import_scene.obj(filepath='../tmp/'+str(data_in['product_id'])+'.obj')
		product = bpy.data.objects[-1]
		product.data.use_auto_smooth = False
		edge_split = product.modifiers.new(name='edge_split', type='EDGE_SPLIT')
		edge_split.use_edge_sharp = False
		bpy.ops.object.modifier_apply({"object":product}, modifier=edge_split.name) 

		#bm = bmesh.new()  
		#bm.from_mesh(bpy.data.meshes[-1]) 
		product.data.materials[0] = new_shader('material_1','diffuse', .2, .2, 1)

		bpy.ops.export_scene.gltf(filepath='../tmp/'+str(data_in['product_id'])+'.glb')
		bpy.data.objects.remove(product, do_unlink=True)
		data_out = {'success':True} 
	except Exception:
		print(traceback.format_exc())

	writer.write(json.dumps(data_out).encode())
	await writer.drain()
	writer.close()


async def main():
    server = await asyncio.start_server(update,'127.0.0.1',7777)
    async with server:
        await server.serve_forever()


def run_main():
    asyncio.run(main())


worker = threading.Thread(target=run_main, daemon=True)
worker.start()
worker.join()




		#product.select_set(True)
		#bpy.context.view_layer.objects.active = product
		#product.select_set(True)

		#setattr(bpy.context, 'active_object', product)
		#bpy.context.temp_override(active_object = product)

		#bpy.ops.object.mode_set({"active_object":product}, mode='EDIT')
		#for vert in product.data.vertices: #bpy.ops.mesh.select_all(action='SELECT')
		#	vert.select = True
		#bpy.ops.mesh.select_all({"mesh":product.mesh},action='SELECT')
		#bpy.ops.uv.smart_project({"object":product},angle_limit=1.15192, island_margin=0.0, area_weight=0.0, correct_aspect=True, scale_to_bounds=False)

		#bpy.ops.object.select_all(action='DESELECT')
		#for ob in bpy.context.scene.objects:
		#	if ob.type == 'MESH':
		#		ob.select_set(state=True)
		#		bpy.context.view_layer.objects.active = ob
		#		bpy.ops.object.mode_set({"active_object":product},mode='EDIT')
		#		bpy.ops.mesh.select_all(action='SELECT')
		#		if len(obj.data.uv_layers) == 0:
		#			obj.data.uv_layers.new()
		#		bpy.ops.uv.smart_project()
		#		bpy.ops.object.mode_set(mode='OBJECT')



# bpy.context.temp_override(object = product)


#try:
#	worker = threading.Thread(target=run_main, daemon=True)
#	worker.start()
#	worker.join()
#except Exception:
#    print(traceback.format_exc())


#bpy.ops.mesh.primitive_ico_sphere_add(location=(0, 0, 0))
#obj = bpy.context.object

#modifier = obj.modifiers.new('Subsurf', 'SUBSURF')
#modifier.levels = 2
#modifier.render_levels = 2

#mesh = obj.data
#for p in mesh.polygons:
#	p.use_smooth = True
