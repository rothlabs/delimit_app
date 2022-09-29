'''
Blender Worker
'''
import bpy
import asyncio, json, threading#, traceback


for obj in bpy.data.objects:
	bpy.data.objects.remove(obj, do_unlink=True)


async def update(reader, writer):
	data_in = await reader.read(1000000) # 1 Megabyte limit
	data_in = json.loads(data_in.decode())

	data_out = {'success':False}
	try:
		bpy.ops.import_scene.obj(filepath='../tmp/product.obj')
		product = bpy.data.objects[-1]
		product.data.use_auto_smooth = False
		edge_split = product.modifiers.new(name='edge_split', type='EDGE_SPLIT')
		edge_split.use_edge_sharp = False
		bpy.ops.object.modifier_apply({"object":product}, modifier=edge_split.name) 
		bpy.ops.export_scene.gltf(filepath='../tmp/product.gltf')
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
