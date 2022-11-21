import config 
import FreeCAD
from . import svg, make, get, mod, sole_op, mix_op, map_op, surf_op, tongue_op, upper_op, export

FreeCAD.openDocument('product.FCStd') 
doc = FreeCAD.ActiveDocument
v = FreeCAD.Vector

def build(args):

    # delete all
    for obj in doc.Objects: doc.removeObject(obj.Name)

    # import svg drawing as FreeCAD objects
    raws = svg.load(args['drawing'])

    # identify svg raw parts and assign labels
    mod.apply_labels(raws) 

    # get a dictionary of important baselines
    baselines = get.baselines(raws)

    mod.transform_right_view(raws, baselines)

    sole_op.handle_insole_profile(raws)

    curves, mixes, fuses, fuse_rim_front_right = mix_op.build(raws, baselines)

    mapped_fronts, mapped_front_right = map_op.build_front_back(curves, baselines, fuses, fuse_rim_front_right)

    mapped_front_right = map_op.build_sides(raws, curves, mapped_fronts, mapped_front_right)

    # build all surfaces except tongue 
    shoe, surfs = surf_op.build(curves, mixes, mapped_fronts, mapped_front_right)

    tongue = tongue_op.build(raws, surfs)

    sole, sole_upper_divide, upper_bound = sole_op.build(shoe, mixes)

    upper = upper_op.build(shoe, sole_upper_divide, upper_bound)

    export.meshes(args['product_id'], [sole, upper, tongue])