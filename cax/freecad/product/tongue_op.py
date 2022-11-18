import config
import FreeCAD
from . import make, get, mod

v = FreeCAD.Vector

# Build Tongue
def build(raws, surfs):
    doc = FreeCAD.ActiveDocument
    tt_profile = get.obj('top_view__tt_profile') # top
    if tt_profile:
        tongue_surfs = []
        tt_baseline, shared_tt_name = get.baseline(raws, tt_profile)
        tf_baseline = get.obj('right_view__tf_baseline') # front
        tb_baseline = get.obj('right_view__tb_baseline') # back
        tt_baseline = make.join(tt_baseline, dir='Z')
        # Make front curve:
        tf_curve = make.join(tf_baseline, dir='Z')
        # Get tongue back inside edges:
        def get_tongue_inside_edges(base_curve):
            surface = make.extrude(base_curve, dir=v(1,0,0), dist=1000, symmetric=True)
            edges = [[],[]]
            for face in surfs:
                solid = make.extrude(face, dir = v(-face.Shape.BoundBox.Center.x,0,0), dist=config.tongue_margin) 
                intersection = make.common([solid, surface]) # USE BOOLIAN FRAGMENTS INSTEAD??? Or Part.Slice? (solid not needed?)
                if len(intersection.Shape.Edges)>0 and intersection.Shape.BoundBox.XLength < 500: # check for weird bug where intersection results in entire tb_surface
                    pe = [] # potential edges
                    for i,e in enumerate(intersection.Shape.Edges):
                        if e.Length > config.tongue_margin*1.5: pe.append({'e':e,'i':i})
                    pe.sort(key = lambda e: abs(e['e'].BoundBox.Center.x))
                    edges[int(pe[0]['e'].BoundBox.Center.x>0)].append((intersection, pe[0]['i'])) # build list of objects with edge index
                else:
                    doc.removeObject(solid.Name)
                    doc.removeObject(intersection.Name)
            return edges
        tb_curve = make.join(tb_baseline, dir='Z')
        edges = get_tongue_inside_edges(tb_curve)
        # Make tongue back curves:
        tb_curves = []
        discrete_tb_baseline = make.discrete(tb_curve, count=config.discrete_count) 
        for lri, lr in enumerate(['__left','__right']):
            tb1 = make.join(edges[lri], dir='Z', approx_tolerance=1, name=tb_baseline.Label+lr+'__in')
            points = []
            for p in discrete_tb_baseline.Points:
                if p.y > tb1.Shape.Vertexes[1].Y or p.z > tb1.Shape.Vertexes[1].Z: # TODO: if p not on tb1 inside curve
                    points.append(v(tb1.Shape.Vertexes[1].X, p.y, p.z))
            if len(points)>1:
                tb2 = make.curve(points, dir='Z', name=tb_baseline.Label+lr+'__out')
                tb_curves.append(make.join([(tb1,0),(tb2,0)], dir='Z', approx_tolerance=1, name=tb_baseline.Label+lr+'__comp'))
            else: tb_curves.append(tb1)
        # Make tongue top curves
        mixed_tt = make.join(make.mix(make.extend(tt_baseline), tt_profile, name=shared_tt_name), dir='X')
        dpc = config.discrete_count 
        discrete_mix = make.discrete(mixed_tt, count=dpc) 
        tt_left   = make.mapped(discrete_mix.Points[:int(dpc/2)], tb_curves[0].Shape.Vertexes[1].Point, tf_curve.Shape.Vertexes[1].Point, mixed_tt.Label+'__left') # left top
        tt_right  = make.mapped(discrete_mix.Points[int(dpc/2):], tf_curve.Shape.Vertexes[1].Point, tb_curves[1].Shape.Vertexes[1].Point, mixed_tt.Label+'__right') # right top
        # Get tongue bottom inside edges
        points = [v(0,tb_curves[0].Shape.Vertexes[0].Y,tb_curves[0].Shape.Vertexes[0].Z), tf_curve.Shape.Vertexes[0].Point]
        tbt_curve = make.curve(points, dir='Z', name='tbt_curve')
        edges = get_tongue_inside_edges(tbt_curve)
        # Make tongue bottom curves
        tbt_curves = []
        discrete_tbt_baseline = make.discrete(tbt_curve, count=config.discrete_count) 
        for lri, lr in enumerate(['__left','__right']):
            tb1 = make.join(edges[lri], dir='Z', name=tbt_curve.Label+lr+'__in')
            points = [tb1.Shape.Vertexes[1].Point, tf_curve.Shape.Vertexes[0].Point]
            tb2 = make.curve(points, dir='Z', name=tbt_curve.Label+lr+'__out')
            tbt_curves.append(make.join([(tb1,0),(tb2,0)], dir='Z', name=tbt_curve.Label+lr+'__comp'))
        # Make tongue surfaces
        tongue_surfs.append(make.surface([(tb_curves[0],0), (tbt_curves[0],0), (tf_curve,0), (tt_left,0)]))
        tongue_surfs.append(make.surface([(tb_curves[1],0), (tbt_curves[1],0), (tf_curve,0), (tt_right,0)]))
        return make.compound(tongue_surfs, name='tongue', vis=True)