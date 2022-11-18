import config
import FreeCAD
from . import make, get, mod

# Build surfaces using clockwise selection of curves starting from bottom curve
def build(curves, mixes, mapped_fronts, mapped_front_right):
    surfs = []
    for c in curves: c.Visibility = False
    #mixes.sort(key = lambda o: o.Shape.BoundBox.ZMin)
    surfs.append(make.surface([(mixes['lowest'][0],0), (mixes['lowest'][1],0)])) # Bottom of sole
    if mapped_front_right: # Surfaces between front edge and right branch of front edge:
        for ei in range(len(mapped_fronts[-1].Shape.Edges)):
            if ei == len(mapped_fronts[-1].Shape.Edges)-1:
                surfs.append(make.surface([(mapped_fronts[-1],ei), (mapped_front_right,ei), (mixes['rim_front'],0)]))
            else:
                surfs.append(make.surface([(mapped_fronts[-1],ei), (mapped_front_right,ei)]))
    for lor in ['__left__','__right__']: 
        for c1 in (c for c in curves if not lor in c.Label and 'above__split' in c.Label): # bottom curve 
            for c1ei, c1e in enumerate(c1.Shape.Edges): # bottom curve edge 
                for c2 in (c for c in curves if not c==c1 and not lor in c.Label): # left curve (usually)
                    for c2ei, c2e in enumerate(c2.Shape.Edges): # left curve edge (usually)
                        if (c1e.Vertexes[0].Point-c2e.Vertexes[0].Point).Length < config.fuse_tolerance_xy:
                            pc3 = [] # possible top (usually) curve and edge
                            for c3 in (c for c in curves if not c==c2 and not 'above__split' in c.Label and not lor in c.Label): # top curve
                                for c3ei, c3e in enumerate(c3.Shape.Edges): # top curve edge
                                    if 'e'+str(config.discrete_count-1) in c2.Label: # SPECIAL CASE: If the c2 is from the last of front/back curve, the c3e will be pointing down instead of back (use vertex 1 as c3e base instead of vertex 0)
                                        if (c2e.Vertexes[1].Point-c3e.Vertexes[1].Point).Length < config.fuse_tolerance_xy: # use vertex 1 as base for c3e
                                            pc3.append({'c':c3, 'e':c3e, 'i':c3ei})
                                    else:
                                        if (c2e.Vertexes[1].Point-c3e.Vertexes[0].Point).Length < config.fuse_tolerance_xy: # use vertex 0 as base for c3e
                                            pc3.append({'c':c3, 'e':c3e, 'i':c3ei})
                            if len(pc3)>0:
                                pc3.sort(key=lambda c:c['e'].BoundBox.Center.z) 
                                c3, c3e, c3ei = pc3[0]['c'], pc3[0]['e'], pc3[0]['i']
                                if (c3e.Vertexes[0].Point-c1e.Vertexes[1].Point).Length < config.fuse_tolerance_xy: # 3 RIGHT surface?
                                    surfs.append(make.surface([(c1,c1ei), (c2,c2ei), (c3,c3ei)]))
                                else:
                                    pc4 = [] # possible last curve, edge, and index (usually right / vertical down)
                                    for c4 in (c for c in curves if not c==c3 and not 'above__split' in c.Label and not lor in c.Label and not 'center' in c.Label):
                                        for c4ei, c4e in enumerate(c4.Shape.Edges): # right edge
                                            if (c3e.Vertexes[1].Point-c4e.Vertexes[0].Point).Length < config.fuse_tolerance_xy: # use vertex 0 as base for c4e
                                                pc4.append({'c':c4, 'e':c4e, 'i':c4ei})
                                            if (c3e.Vertexes[1].Point-c4e.Vertexes[1].Point).Length < config.fuse_tolerance_xy: # use vertex 1 as base for c4e
                                                pc4.append({'c':c4, 'e':c4e, 'i':c4ei})
                                    if len(pc4)>0:
                                        pc4.sort(key=lambda c:c['e'].BoundBox.Center.z)
                                        c4, c4e, c4ei = pc4[0]['c'], pc4[0]['e'], pc4[0]['i']
                                        if (c4e.Vertexes[0].Point-c1e.Vertexes[1].Point).Length < config.fuse_tolerance_xy: # final curve connects with first?
                                            surfs.append(make.surface([(c1,c1ei), (c2,c2ei), (c3,c3ei), (c4,c4ei)]))
                                        else: # This case happens between the front and top baselines (5 side polygon):
                                            for c5 in curves: # Get 5th side:
                                                for c5ei, c5e in enumerate(c5.Shape.Edges):
                                                    if (c5e.Vertexes[0].Point-c1e.Vertexes[1].Point).Length < config.fuse_tolerance_xy: 
                                                        if (c5e.Vertexes[1].Point-c4e.Vertexes[1].Point).Length < config.fuse_tolerance_xy:
                                                            if config.join_polygon_edges:
                                                                jc = make.join([(c3,c3ei),(c4,c4ei)], dir='Y', name='polygon_join'+lor)
                                                                surfs.append(make.surface([(c1,c1ei), (c2,c2ei), (jc,0),(c5,c5ei)]))
                                                            else:
                                                                c6p = []
                                                                if config.straight_polygon_splice:
                                                                    c6p.append(c2.Base.Shape.Vertexes[0].Point)
                                                                    c6p.append(c5.Base.Shape.Vertexes[-1].Point)
                                                                else:
                                                                    for i, c5p in enumerate(c5.Base.Shape.Vertexes):
                                                                        ratio = math.sqrt(i / (len(c5.Base.Shape.Vertexes)-1))
                                                                        ap = c2.Base.Shape.Vertexes[i].Point*(1-ratio) + c5p.Point*ratio
                                                                        c6p.append(ap)
                                                                c6 = make.curve(c6p, dir='Z', name=(lor+'splice')[2:])
                                                                surfs.append(make.surface([(c2,c2ei), (c3,c3ei), (c4,c4ei),(c6,0)]))
                                                                surfs.append(make.surface([(c1,c1ei), (c5,c5ei), (c6,0)]))
    return make.compound(surfs, name='shoe'), surfs