'''
Blender Worker
'''
import bpy
import asyncio, json, threading, traceback 

for obj in bpy.data.objects:
	bpy.data.objects.remove(obj, do_unlink=True)

async def update(reader, writer):
	print('got jobs')
	data = await reader.read()
	data = json.loads(data.decode())

	bpy.ops.import_scene.obj(filepath='../tmp/product.obj')
	print([o.name for o in bpy.data.objects])
	product = bpy.data.objects[-1]
	product.data.use_auto_smooth = False
	edge_split = product.modifiers.new(name='edge_split', type='EDGE_SPLIT')
	edge_split.use_edge_sharp = False
	bpy.ops.object.modifier_apply({"object":product}, modifier=edge_split.name) 
	bpy.ops.export_scene.gltf(filepath='../tmp/product.gltf')
	bpy.data.objects.remove(product, do_unlink=True)

	writer.write(json.dumps({'success':True}).encode())
	writer.close()
	#await writer.drain()

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
