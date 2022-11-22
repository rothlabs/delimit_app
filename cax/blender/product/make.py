from random import random
import bpy, bmesh # From Blender
from . import get

def material(type, r, g, b): #(name, type, r, g, b):
	#mat = bpy.data.materials.get(name)
	#if mat is None:
	#	mat = bpy.data.materials.new(name=name)
	mat = bpy.data.materials.new(name=get.random_id())
	mat.use_nodes = True
	if mat.node_tree:
		mat.node_tree.links.clear() 
		mat.node_tree.nodes.clear()
	#mat = new_material(id)
	nodes = mat.node_tree.nodes
	links = mat.node_tree.links
	output = nodes.new(type='ShaderNodeOutputMaterial')
	texture = nodes.new('ShaderNodeTexImage')
	texture.image = bpy.data.images.load("../textures/checkers.png")
	rgb = nodes.new('ShaderNodeRGB')
	rgb.color = (r, g, b)
	shader = nodes.new(type='ShaderNodeBsdfPrincipled')
		#print(nodes[1])
		#shader.inputs['Subsurface'].default_value = .5 # subsurface amount
		#shader.inputs['Subsurface Color'].default_value = (r, g, b, 1) # Subsurface color
	links.new(texture.outputs["Color"], shader.inputs["Base Color"])
	links.new(rgb.outputs["Color"], shader.inputs[3])
	links.new(shader.outputs[0], output.inputs[0])
	return mat
