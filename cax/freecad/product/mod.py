from . import svg, make, get, mod
import config # From delimit/cax
import FreeCAD, FreeCADGui, Mesh, Part, MeshPart # From FreeCAD
import math # From Python Built-In

v = FreeCAD.Vector

def transform(obj, translate=v(0,0,0), rotate=(v(1,0,0),0), scale=1): # use_center=False
    shp = obj.Shape.copy()
    shp.translate(translate)
    shp.rotate(v(0,0,0),rotate[0],rotate[1])
    shp.scale(scale)
    obj.Shape = shp

def transform_right_view(raws, baselines):
    right_view_scale = config.length_y / baselines['lowest'].Shape.BoundBox.XLength #front_baseline.Shape.BoundBox.XLength

    right_view_translate = -(baselines['lowest'].Shape.BoundBox.Center+baselines['rim'].Shape.BoundBox.Center)/2
    for obj in raws:
        if 'right_view' in obj.Label: 
            mod.transform(obj, translate=right_view_translate, rotate=(v(1,1,1),120), scale=right_view_scale)
            if 'insole' in obj.Label:
                original_center = obj.Shape.BoundBox.Center
                mod.transform(obj, scale=(obj.Shape.BoundBox.YLength-config.toe_heel_y_thickness*2) / obj.Shape.BoundBox.YLength)
                mod.transform(obj, translate = original_center - obj.Shape.BoundBox.Center) # - config.toe_heel_y_thickness

# Identify SVG parts and assign labels
def apply_labels(raws):
    view_labels = ['Top','Right','Left','Front','Back','Bottom', 'top','right','left','front','back','bottom']
    view_tags  = [(o.LabelText, Part.Vertex(o.Position)) for o in raws if hasattr(o,'LabelText') and any(t in o.LabelText for t in view_labels)]
    shape_tags = [(o.LabelText, Part.Vertex(o.Position)) for o in raws if hasattr(o,'LabelText') and not any(t in o.LabelText for t in view_labels)]
    # Set views:
    def set_view_label(text, tagged_shapes):
        tod = [] # text, object, distance
        for o1 in raws:
            if not o1.Label[-3:]=='___' and hasattr(o1,'Shape') and not hasattr(o1,'LabelText'): # and any(t in o1.Label for t in view_labels):
                for shape in tagged_shapes:
                    dist = shape.distToShape(o1.Shape)[0]
                    if len(tagged_shapes)<2 or dist < (o1.Shape.BoundBox.XLength + o1.Shape.BoundBox.YLength)/2 *.15: # within 20% of size
                        tod.append({'t':text, 'o':o1, 'd':dist}) 
        if len(tod)>0:
            tod.sort(key = lambda o: o['d'])
            tod[0]['o'].Label = str(tod[0]['t'][0]).lower()+'_view__'+get.random_id()+'___'
            tagged_shapes.append(tod[0]['o'].Shape)
            set_view_label(text, tagged_shapes)
    for tag in view_tags:
        set_view_label(tag[0],[tag[1]])
    # Set shapes:
    view_labels = [v+'_view__' for v in ['front','back','left','right','top','bottom']]
    for st in shape_tags:
        tag_obj_dist = [(st[0], o, st[1].distToShape(o.Shape)[0]) for o in raws if hasattr(o,'Shape')]# and any(t in o.Label for t in view_labels)]
        if len(tag_obj_dist) < 1: raise Exception('No view objects found while attemping to set shape labels.')
        tag_obj_dist.sort(key = lambda o: o[2]) 
        suffix = '_profile'
        if 'right_view__' in tag_obj_dist[0][1].Label: 
            suffix = '_baseline'  
            #baselines.append(tag_obj_dist[0][1])
        tag_obj_dist[0][1].Label = tag_obj_dist[0][1].Label.replace('_view__','_view__'+str(tag_obj_dist[0][0][0])+suffix)[:-7]
        if tag_obj_dist[0][1].Label[-3:] == '001':
            for o1 in raws:
                if o1.Label == tag_obj_dist[0][1].Label[:-3]:
                    lor = ['left__','right__']
                    if o1.Shape.BoundBox.Center.x > tag_obj_dist[0][1].Shape.BoundBox.Center.x: lor.reverse()
                    o1.Label = o1.Label.replace('_view__','_view__'+lor[0])
                    tag_obj_dist[0][1].Label = tag_obj_dist[0][1].Label.replace('_view__','_view__'+lor[1])[:-3]
    for o1 in raws:
        o1.Visibility = False
        if o1.Label[-3:] == '___':
            if 'right_view__' in o1.Label:
                for o2 in raws:
                    if o2.Label[-3:] == '___':
                        if 'right_view__' in o2.Label:
                            fob = ['right_view__front_baseline','right_view__back_baseline']
                            if o1.Shape.BoundBox.Center.x > o2.Shape.BoundBox.Center.x: fob.reverse()
                            o1.Label = fob[0]
                            o2.Label = fob[1]
            else:
                o1.Label = o1.Label[-7:-3] # reduce to the four random characters