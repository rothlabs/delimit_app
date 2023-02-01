import config
import FreeCAD
from . import make, get, mod

v = FreeCAD.Vector

def handle_insole_profile(raws):
    for obj in raws:
        if 'top_view' in obj.Label and '(insole)' in obj.Label:
            obj.Label = obj.Label.replace(' (insole)','')
            insole_profile = make.copy(obj, name='top_view__insole_profile')
            raws.append(insole_profile)
            break


# Make sole
def build(shoe, mixes):
    sole_baseline = get.obj('right_view__sole_baseline')
    # Cut upper away:
    sole_baseline_join = make.join(sole_baseline,dir='Y')
    sole_upper_divide = make.extend(sole_baseline_join, dist=150)
    sole_baseline_offset = make.offset(sole_upper_divide, dist=-config.sole_overlap)
    sole_baseline_offset_join = make.join(sole_baseline_offset,dir='Y')
    sole_baseline_offset_2 = make.offset(sole_upper_divide, dist=-150)
    upper_bound = make.join(sole_baseline_offset_2,dir='Y')
    sole_cut_surf = make.surface([(sole_baseline_offset_join,0), (upper_bound,0)])
    sole_block = make.extrude(sole_cut_surf, dir=v(1,0,0), dist=300, symmetric=True)
    sole = make.cut(shoe, sole_block, name='sole')
    sole_subs = [sole]
    # Get sole rim
    edges = [[],[]]
    for ei, e in enumerate(sole.Shape.Edges):
        if len(e.Vertexes) == 2:
            if e.Vertexes[0].distToShape(sole_block.Shape)[0] < .001 and e.Vertexes[1].distToShape(sole_block.Shape)[0] < .001:
                edges[int(e.BoundBox.Center.x>0)].append((sole,ei))
    # Make surfaces
    sole_subs.append(make.surface([(mixes['insole'][0],0), (mixes['insole'][1],0)]))
    for lri, lr in enumerate(['left','right']):
        edges[lri].sort(key=lambda o: o[0].Shape.Edges[o[1]].BoundBox.Center.y)
        sole_rim_outer = make.join(edges[lri], dir='Y', name='sole_rim__outer__'+lr)
        bb = sole_rim_outer.Shape.BoundBox
        sole_rim_outer_discrete = make.discrete(sole_rim_outer, count=config.discrete_count)
        points = [] # need to make a make_curve type function where you pass a function for determining points
        for pi, p in enumerate(sole_rim_outer_discrete.Points): # approximate offset, needs reworked
            if lri == 0: x = p.x - config.sole_rim_thickness * (p.x-bb.XMax)/bb.XLength*2 #(lri*2-1) * 
            else: x = p.x - config.sole_rim_thickness * (p.x-bb.XMin)/bb.XLength*2
            y = p.y - config.sole_rim_thickness * (p.y-bb.Center.y)/bb.YLength*2
            points.append(v(x,y,p.z))
        sole_rim_inner = make.curve(points, dir='Y', name='sole_rim__inner__'+lr)
        sole_subs.append(make.surface([(sole_rim_outer,0), (sole_rim_inner,0)]))
        sole_subs.append(make.surface([(mixes['insole'][lri],0), (sole_rim_inner,0)]))
    return make.compound(sole_subs, name='sole', vis=True), sole_upper_divide, upper_bound