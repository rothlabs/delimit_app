import math
import bpy
import config
from . import get

def edit_mode(obj):
    for o in bpy.data.objects: o.select_set(False)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode = 'EDIT')
    bpy.ops.mesh.select_all(action = 'SELECT')

def unwrap(obj):
    edit_mode(obj)
    bpy.ops.uv.unwrap(method='ANGLE_BASED', fill_holes=True, correct_aspect=True, use_subsurf_data=False, margin=0.001) # CONFORMAL faster but not as accurate?

def add_blender_modifier():
    def wrap(func):
        def wrapped_func(*args, **kwargs):
            modifier = args[0].modifiers.new(name=get.random_id()+'__'+func.__name__, type=func.__name__.upper())
            func(modifier, *args, **kwargs)
            bpy.ops.object.mode_set(mode = 'OBJECT')
            bpy.ops.object.modifier_apply({'object':args[0]}, modifier=modifier.name) 
        return wrapped_func
    return wrap

@add_blender_modifier()
def solidify(modifier, obj):
    modifier.solidify_mode = 'NON_MANIFOLD'
    modifier.nonmanifold_thickness_mode = 'EVEN'
    modifier.thickness = config.voxel_size * 2
    modifier.offset = 0

@add_blender_modifier()
def remesh(modifier, obj):
    modifier.voxel_size = config.voxel_size

@add_blender_modifier()
def decimate(modifier, obj):
    modifier.ratio = .01

@add_blender_modifier()
def edge_split(modifier, obj):
    modifier.split_angle = 20 * math.pi/180 
    edit_mode(obj)
    bpy.ops.mesh.faces_shade_smooth()

@add_blender_modifier()
def boolean(modifier, obj, cut):
    modifier.object = cut