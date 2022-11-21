import math, time
import bpy
import config
from . import get

def add_blender_modifier():
    def wrap(func):
        def wrapped_func(*args, **kwargs):
            modifier = args[0].modifiers.new(name=get.random_id()+'__'+func.__name__, type=func.__name__.upper())
            func(modifier, *args, **kwargs)
            bpy.ops.object.modifier_apply({"object":args[0]}, modifier=modifier.name) 
        return wrapped_func
    return wrap

@add_blender_modifier()
def solidify(modifier, obj):
    modifier.solidify_mode = 'NON_MANIFOLD'
    modifier.nonmanifold_thickness_mode = 'EVEN'
    modifier.thickness = config.voxel_size * 1.5
    modifier.offset = 0

@add_blender_modifier()
def remesh(modifier, obj):
    modifier.voxel_size = config.voxel_size

@add_blender_modifier()
def decimate(modifier, obj):
    modifier.ratio = .1

@add_blender_modifier()
def edge_split(modifier, obj):
    modifier.split_angle = 20 * math.pi/180 

def get_context(active_object):
    # create a context that works when blender is executed from the command line.
    #idx = bpy.context.window_manager.windows[:].index(bpy.context.window)
    window = bpy.context.window_manager.windows[0]#[idx]
    screen = window.screen
    views_3d = sorted(
            [a for a in screen.areas if a.type == 'VIEW_3D'],
            key=lambda a: (a.width * a.height))
    a = views_3d[0]
    #print(bpy.context.window_manager.windows)
    #print(screen)
    #print(a)
    #print(a.spaces.active)
    #print(a.regions[-1])
    # override
    o = {"window" : window,
         "screen" : screen,
         "area" : a,
         "space_data": a.spaces.active,
         "region" : a.regions[-1],
         "active_object" : active_object,
         "object" : active_object,
         #"mode": 'EDIT_MESH',
    }
    return o

def unwrap(obj):
    #setattr(bpy.context, 'object', obj)
    #print('____')
    #print('start showing context')
    #for attr in dir(bpy.context):
    #    print('attr name: '+str(attr))
    #    print(getattr(bpy.context,attr))
    #print('done showing context')
    #print('____')
    #print(bpy.context.object)
    #c = bpy.context.copy()
    #c['object'] = obj
    #c['active_object'] = obj
    #bpy.context.scene.objects.active = obj
    time.sleep(2)
    #print('Active Object: '+ str(bpy.context.object))
    bpy.context.view_layer.objects.active = obj
    #bpy.ops.object.mode_set({"active_object":obj}, mode = 'EDIT')
    bpy.ops.object.mode_set(get_context(obj),mode = 'EDIT')
    #bpy.ops.object.mode_set(get_context(obj), mode = 'EDIT_MESH')
    #uvlayer = obj.data.uv_layers.new() # default naem and do_init
    #obj.data.uv_layers.active = uvlayer
    bpy.ops.uv.unwrap(method='ANGLE_BASED', fill_holes=True, correct_aspect=True, use_subsurf_data=False, margin=0.001)