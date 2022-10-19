'''
Provides core functionality for generating product models from drawings.
Most objects are created with a bread-crumb naming scheme to make everything explicit in the FreeCAD Tree View.
If an object has 001, 002, etc at the end of the its name, there might be unnecessary dubplicated generation.
The drawing SIDE view contains BASELINES and the TOP & FRONT views contain PROFILES. Baselines and profiles are mixed to generate 3D curves.
'''

import FreeCAD as fc # From FreeCAD
import Mesh, Part, MeshPart # From FreeCAD
from importSVG import svgHandler # From FreeCAD
from Curves import JoinCurves, approximate_extension, Discretize, mixed_curve, curveExtendFP, splitCurves_2  # From https://github.com/tomate44/CurvesWB
import xml.sax # From Python Built-In

v = fc.Vector

class Product:
    def __init__(self, name):
        self.doc = fc.openDocument('templates/'+name+'.FCStd') 
        self.mesh = self.get('mesh')
        self.shape = self.get('compound')
        self.svg_handler = svgHandler()
        self.svg_handler.doc = self.doc
        self.depth = 250
    

    def generate(self,path):
        # The svg_handler inserts svg paths as seperate objects in the FreeCAD document
        xml.sax.parse(path, self.svg_handler)

        # Gather information about the imported paths before any transformations
        self.svg_parts = self.doc.Objects
        front_baseline = self.get('side_view__front_baseline')
        back_baseline = self.get('side_view__back_baseline')
        insole_baseline = self.get('side_view__insole_baseline')
        insole_baseline.Visibility = False
        side_view_scale = self.depth / front_baseline.Shape.BoundBox.XLength
        side_view_translate = -front_baseline.Shape.BoundBox.Center
        f_points = [[],[]] # front and back fuse points
        curves = [] # Final curves used for surfacing

        # Transform all SIDE view objects
        for obj in self.svg_parts:
            obj.Visibility = False
            if 'side_view' in obj.Name: 
                transform(obj, translate=side_view_translate, rotate=(v(1,1,1),120), scale=side_view_scale)
            #if 'material' in obj.Name:
            #    obj.Visibility = False

        # Build curves from TOP & SIDE views
        for obj in self.svg_parts:
            if 'top_view' in obj.Name and 'profile' in obj.Name:
                profile = obj
                baseline, shared_name = self.baseline(profile)

                # Transform TOP view profiles
                transform(profile, rotate = (v(0,0,1),90), scale = (baseline.Shape.BoundBox.YLength-.5)/profile.Shape.BoundBox.XLength)
                transform(profile, translate = baseline.Shape.BoundBox.Center - profile.Shape.BoundBox.Center)#v(blc.x-pc.x, bvy-profile.Shape.BoundBox.YMax, blc.z-pc.z))#baseline.Shape.BoundBox.Center - profile.Shape.BoundBox.Center)
                
                # This section preps information for generating mixed curves from TOP & SIDE views
                joined_profile = join_curve(profile)
                joined_baseline = join_curve(baseline)
                dpc = 60 # discretize point count
                profile_points = discretize(joined_profile, dpc*2).Points
                baseline_points = discretize(joined_baseline, dpc).Points
                bi = 0 # baseline index
                baseline_start = baseline_points[0]
                baseline_end = baseline_points[-1]
                baseline_dir = 1
                if baseline_points[0].y < baseline_points[-1].y:
                    bi = len(baseline_points)-1
                    baseline_start = baseline_points[-1]
                    baseline_end = baseline_points[0]
                    baseline_dir = -1
                close_i1 = 0
                close_i2 = 0
                for i, p in enumerate(profile_points): # Get the profile indecies that are closest to start and end points of baseline
                    if abs(p.x) < abs(profile_points[close_i1].x):
                        close_i2 = close_i1
                        close_i1 = i
                pi = close_i1 # profile index
                if (profile_points[close_i2]-baseline_points[bi]).Length < (profile_points[close_i1]-baseline_points[bi]).Length:
                    pi = close_i2
                profile_start = profile_points[pi]
                profile_end = profile_points[pi + dpc] # Could result in out of bounds error? ----------------------------------------- !!!
                dist_between_points = profile.Shape.Length / (dpc*2)
                m_points = [] # mixed points
                p_points = [] # profile points

                # This loop goes up and down the baseline to gather point data from baseline and profile
                
                for d in range(2): 
                    for n in baseline_points:
                        if bi == 0 or bi == dpc-1: # fuse point:
                            m_points.append(  v(profile_points[pi].x, baseline_points[bi].y, baseline_points[bi].z)  ) 
                        else: # regular point:
                            lbs = baseline_points[bi] - baseline_start
                            lbe = baseline_points[bi] - baseline_end
                            lps = profile_points[pi] - profile_start
                            lpe = profile_points[pi] - profile_end
                            ratio = bi / (dpc-1) # Smoothly shift point reference from start and end of baseline
                            px = (baseline_start.x + lps.x)*(1-ratio)           + (baseline_end.x + lpe.x)*(ratio)
                            my = (baseline_start.y + (lbs.y+lps.y)/2)*(1-ratio) + (baseline_end.y + (lbe.y+lpe.y)/2)*(ratio)
                            scale_z = abs(px) / joined_profile.Shape.BoundBox.XLength * 3 # smooth along x axis
                            if scale_z>1: scale_z=1
                            bz = (baseline_start.z + lbs.z*scale_z)*(1-ratio)           + (baseline_end.z + lbe.z*scale_z)*(ratio)
                            m_points.append(  v(px, my, bz)  ) 
                            #m_points.append(  v(profile_points[pi].x, (baseline_points[bi].y+profile_points[pi].y)/2, baseline_points[bi].z)  ) 
                        p_points.append(profile_points[pi])
                        #if bi < len(baseline.Points): b_points.append(baseline[bi])
                        bi = bi + baseline_dir
                        pi = pi + 1
                        if pi >= len(profile_points): pi = 0 # loop profile index
                    bi = max(0,min(bi,dpc-1)) # clamp baseline index
                    baseline_dir = -baseline_dir
                

                test_mix = mix_curve(joined_baseline, joined_profile)
                if len(test_mix.Shape.Edges) == 1: # only use mix_curve if 1 edge produced
                    # This section creates a perfect mixed curve from TOP & SIDE view (requires function-of-(x or z) source curves)
                    p_right = make_curve(p_points[:dpc], name=profile.Name+'__right', dir='Y') # Remove common name?
                    left_points = p_points[dpc-1:]
                    left_points.append(p_points[0])
                    p_left = make_curve(left_points, name=profile.Name+'__left', dir='Y') #reverse=True
                    curves.append(join_curve(mix_curve(joined_baseline, p_right, name=shared_name+'__right'), dir='Y')) # curves.append(mix_curve(joined_baseline, p_right, name=shared_name+'__right')) #
                    curves.append(join_curve(mix_curve(joined_baseline, p_left, name=shared_name+'__left'), dir='Y')) # curves.append(mix_curve(joined_baseline, p_left, name=shared_name+'__left')) #
                    fob = curves[-1].Shape.Vertexes[0].Y > curves[-1].Shape.Vertexes[1].Y
                    f_points[int(fob )].append(curves[-1].Shape.Vertexes[0].Point) # save fuse point
                    f_points[int(not fob)].append(curves[-1].Shape.Vertexes[1].Point) # save fuse point
                else:
                    # This section creates an approximate mixed curve from TOP & SIDE view (allows non-function-of-(x or z) source curves)
                    m_points.insert(dpc,v(m_points[dpc-1].x-dist_between_points/2, m_points[dpc-1].y, m_points[dpc-1].z)) # center point between left and right mixes
                    m_points.insert(0,v(m_points[0].x-dist_between_points/2, m_points[0].y, m_points[0].z)) # center point between left and right mixes
                    dpc += 2
                    f_points[0].append(m_points[dpc-1]) # save front fuse point
                    f_points[1].append(m_points[0]) # save back fuse point
                    curves.append(make_curve(m_points[:dpc], name=shared_name+'__right', dir='Y', visibility=True))
                    left_points = m_points[dpc-1:]
                    left_points.append(m_points[0])
                    curves.append(make_curve(left_points, name=shared_name+'__left', dir='Y', visibility=True)) #reverse=True
                self.doc.removeObject(test_mix.Name)
        
        # Build the front and back curves so they hit all the fuse points at the curves that were mixed from TOP & SIDE
        fb_point_count = 100
        for bi, baseline in enumerate([front_baseline,back_baseline]):
            discrete_baseline = discretize(join_curve(baseline, dir='Z'), fb_point_count)
            f_points[bi].sort(key=lambda p:p.z)
            points = []
            fi = 0 # fuse point index
            last_i = 0
            #split_index = -1
            for i, p in enumerate(discrete_baseline.Points):
                dist = (v(0,p.y,p.z) - v(0,f_points[bi][fi].y,f_points[bi][fi].z)).Length
                if dist < 2:# or (bi==0 and split_index == 0): # fuse when within 1 mm
                    #if not split_index == 0: 
                    points.append(f_points[bi][fi])
                    if len(points)>1:
                        #if split_index == 0: print('AHHHHHHHHHHHHHH!!!')
                        curves.append(make_curve(points, name=discrete_baseline.Name+'__s'+str(last_i)+'_e'+str(i), visibility=True))
                        last_i = i
                        #new_start_point = points[-1]
                        points.clear()
                        #if split_index == 0: 
                        #    points.append(new_start_point)
                        #else:
                        points.append(f_points[bi][fi])
                    #if not split_index == 0: 
                    fi += 1
                        #if bi==0 and fi == len(f_points[bi])-1:
                            #split_index = 6
                            #print('made it!!!!!!!!!!!!')
                    #else: 
                    #    split_index = -1
                    if fi >= len(f_points[bi]):
                        break
                    f_span = (v(0,f_points[bi][fi-1].y,f_points[bi][fi-1].z) - v(0,f_points[bi][fi].y,f_points[bi][fi].z)).Length
                else: 
                    ratio = dist / f_span
                    x = f_points[bi][fi].x*(1-ratio) + f_points[bi][fi-1].x*ratio
                    points.append(v(x, p.y, p.z))
                #split_index -= 1
        
        # Build curves from FRONT, BACK, & SIDE views 
        split_curves = [[],[]] # curves split by 'above' and 'below' cutters
        curves_to_append = []
        curves_to_remove = []
        for obj in self.svg_parts:
            if ('front_view' in obj.Name or 'back_view' in obj.Name) and 'profile' in obj.Name and 'left' in obj.Name:
                profiles = [obj, self.get(obj.Name.replace('left','right'))] 
                baseline, shared_name = self.baseline(obj)

                # Find fuse points
                f_points = [[],[]] # left and right fuse points
                curves_to_split = [[],[]]
                joined_baseline = join_curve(baseline)
                extended_baseline = extend(joined_baseline) # extend to make sure it crosses approximated curves from side view perspective
                surface_baseline = extrude(extended_baseline, symmetric=True) 
                solid_baseline = extrude(surface_baseline, dir=v(0,1,0), length=1) # For some reason, intersect is not working with surfaces, so extrude surface as solid
                for curve in curves:
                    intersection = intersect(solid_baseline, curve) 
                    verts = intersection.Shape.Vertexes
                    if len(verts) > 1:
                        if 'front' in curve.Name or 'back' in curve.Name: # add fuse point to left AND right if on front or back curve
                            f_points[0].append(verts[int(verts[0].Y > verts[1].Y)].Point)
                            f_points[1].append(verts[int(verts[0].Y > verts[1].Y)].Point)
                            curves_to_split[0].append(curve)
                        else: # Add lowest Y-value point to left OR right list:
                            f_points[int(verts[0].X > 0)].append(verts[int(verts[0].Y > verts[1].Y)].Point) 
                            curves_to_split[int(verts[0].X > 0)].append(curve)
                    self.doc.removeObject(intersection.Name)
                    #curve.Visibility = True
                self.doc.removeObject(solid_baseline.Name)
                self.doc.removeObject(surface_baseline.Name)
                self.doc.removeObject(extended_baseline.Name)

                for pi, profile in enumerate(profiles):
                    f_points[pi].sort(key=lambda p:p.z)
                    # Transform front view profiles:
                    transform(profile, rotate = (v(1,0,0),90), scale = (baseline.Shape.BoundBox.ZLength)/profile.Shape.BoundBox.YLength)
                    transform(profile, translate = baseline.Shape.BoundBox.Center - profile.Shape.BoundBox.Center)
                    # Mix curves:
                    joined_profile = join_curve(profile, dir='Z')
                    suffix = '__left'
                    if pi>0: suffix = '__right'
                    mix = mix_curve(joined_baseline, joined_profile, profile_dir=v(0,1,0), name=shared_name+suffix)
                    joined_mix = join_curve(mix, dir='Z') # joining to force direction to +Z
                    dpc = 60 # discretize point count
                    discrete_mix = discretize(joined_mix,dpc) #copy().sort(key=lambda fp:fp.z)
                    a_points = [f_points[pi][0]] # adjusted points
                    for mi, mp in enumerate(discrete_mix.Points):
                        lmp = mp - discrete_mix.Points[0] # mixed point local to start
                        rlmp = mp - discrete_mix.Points[-1] # mixed point local to end
                        ratio = mi / dpc 
                        ap = (f_points[pi][0] + lmp)*(1-ratio) + (f_points[pi][1] + rlmp)*ratio
                        a_points.append(ap)
                    a_points.append(f_points[pi][1])
                    curves.append(make_curve(a_points, dir='Z', name=discrete_mix.Name, visibility=True))
                    # Split curves that the new mixes intersect with:
                    for cts in curves_to_split[pi]:
                        new_split = True
                        aob = int(cts.Shape.BoundBox.Center.z < curves[-1].Shape.BoundBox.Center.z) # Above OR Below index, might not work for extreme curves
                        for sc in split_curves[aob]:
                            if cts == sc['source']:
                                if not curves[-1] in sc['result'].CuttingObjects:
                                    cutting_objects = sc['result'].CuttingObjects.copy()
                                    cutting_objects.append(curves[-1])
                                    sc['result'].CuttingObjects = cutting_objects
                                    sc['result'].recompute()
                                new_split = False
                                break
                        if new_split:
                            suffix = '__below'
                            if aob>0: suffix = '__above'
                            split = split_curve(cts,curves[-1], name=cts.Name+suffix)
                            split_curves[aob].append({'source':cts, 'result':split})
                            curves_to_append.append(split)
                            curves_to_remove.append(cts)
                        cts.Visibility = False
        for ctr in curves_to_remove:
            if ctr in curves: curves.remove(ctr)
        for cta in curves_to_append:
            curves.append(cta)

        # Create surfaces
        for c in curves: c.Visibility = False
        for lor in ['left','right']: 
            for c1 in (c for c in curves if not lor in c.Name and 'above__split' in c.Name): # bottom curve 
                for c1ei, c1e in enumerate(c1.Shape.Edges): # bottom curve edge 
                    for c2 in (c for c in curves if not c==c1 and not lor in c.Name): # left curve (usually)
                        for c2ei, c2e in enumerate(c2.Shape.Edges): # left curve edge (usually)
                            if (c1e.Vertexes[0].Point-c2e.Vertexes[0].Point).Length < 0.1:
                                pc3 = [] # possible top (usually) curve and edge
                                for c3 in (c for c in curves if not c==c2 and not 'above__split' in c.Name and not lor in c.Name): # top curve
                                    for c3ei, c3e in enumerate(c3.Shape.Edges): # top curve edge
                                        if 'e'+str(fb_point_count-1) in c2.Name: # SPECIAL CASE: If the c2 is from the last of front/back curve, the c3e will be pointing down instead of back (use vertex 1 as c3e base instead of vertex 0)
                                            if (c2e.Vertexes[1].Point-c3e.Vertexes[1].Point).Length < 0.1: # use vertex 1 as base for c3e
                                                pc3.append({'c':c3, 'e':c3e, 'i':c3ei})
                                        else:
                                            if (c2e.Vertexes[1].Point-c3e.Vertexes[0].Point).Length < 0.1: # use vertex 0 as base for c3e
                                                pc3.append({'c':c3, 'e':c3e, 'i':c3ei})
                                if len(pc3)>0:
                                    pc3.sort(key=lambda c:c['e'].BoundBox.Center.z) 
                                    c3, c3e, c3ei = pc3[0]['c'], pc3[0]['e'], pc3[0]['i']
                                    if (c3e.Vertexes[0].Point-c1e.Vertexes[1].Point).Length < 0.1: # 3 side surface?
                                        make_surface([(c1,c1ei), (c2,c2ei), (c3,c3ei)])
                                    else:
                                        pc4 = [] # possible last curve, edge, and index (usually right / vertical down)
                                        for c4 in (c for c in curves if not c==c3 and not 'above__split' in c.Name and not lor in c.Name):
                                            for c4ei, c4e in enumerate(c4.Shape.Edges): # right edge
                                                if (c3e.Vertexes[1].Point-c4e.Vertexes[0].Point).Length < 0.1: # use vertex 0 as base for c4e
                                                    pc4.append({'c':c4, 'e':c4e, 'i':c4ei})
                                                if (c3e.Vertexes[1].Point-c4e.Vertexes[1].Point).Length < 0.1: # use vertex 1 as base for c4e
                                                    pc4.append({'c':c4, 'e':c4e, 'i':c4ei})
                                        if len(pc4)>0:
                                            pc4.sort(key=lambda c:c['e'].BoundBox.Center.z)
                                            c4, c4e, c4ei = pc4[0]['c'], pc4[0]['e'], pc4[0]['i']
                                            if (c4e.Vertexes[0].Point-c1e.Vertexes[1].Point).Length < 0.1: # final side connects with first side?
                                                make_surface([(c1,c1ei), (c2,c2ei), (c3,c3ei), (c4,c4ei)])
                                            else:
                                                make_surface([(c2,c2ei), (c3,c3ei), (c4,c4ei)])

    # Get the corresponding baseline to the given profile.
    def baseline(self,profile):
        for obj in self.svg_parts:
            if 'baseline' in obj.Name:
                sn = shared_name(obj) 
                if sn == shared_name(profile):
                    return obj, sn

    # Get a FreeCAD object by path
    def get(self, path):
        path = path.split('/')
        def search(objects):
            for obj in objects:
                if obj.Name == path[0]:
                    if len(path) > 1:
                        path.pop(0)
                        return search(obj.OutList)
                    else: 
                        return obj
        return search(self.doc.RootObjects)

    # Export as .obj file
    def export(self,product_id):
        self.doc.recompute() 
        shp = self.shape.Shape.copy()
        shp.rotate(v(0,0,0), v(1,0,0), -90)
        self.mesh.Mesh = MeshPart.meshFromShape(shp, LinearDeflection=0.08, AngularDeflection=0.15, Relative=False)
        self.mesh.recompute()
        Mesh.export([self.mesh],'../tmp/'+str(product_id)+'.obj')



# Make Surface from list of curves and edges
def make_surface(curves_and_edges):
    s = fc.ActiveDocument.addObject('Surface::GeomFillSurface','Surface')
    s.BoundaryList = [(ce[0],'Edge'+str(ce[1]+1)) for ce in curves_and_edges]
    s.FillType = 1
    s.recompute()
    print('Surface:')
    for i, ce in enumerate(curves_and_edges):
        print('C'+str(i)+': '+ce[0].Name+', edge: '+str(ce[1]+1))
    return s

# Split source curve at cutter 
def split_curve(source, cutter, name='untitled'):
    c = fc.ActiveDocument.addObject("Part::FeaturePython", name+'__split')
    splitCurves_2.split(c, (source,'Edge1'))
    splitCurves_2.splitVP(c.ViewObject)
    c.Values = []
    c.CuttingObjects = [cutter]
    c.ViewObject.PointSize = 5.0
    wireframe_style(c)
    c.recompute()
    source.Visibility = False
    return c

# Get intersection of shapes
def intersect(source_a, source_b, name='untitled'):
    b = fc.activeDocument().addObject("Part::MultiCommon", name+'__intersect')
    b.Shapes = [source_a,source_b]
    b.recompute() # TODO: Find way to suppress error message when no intersection is found
    return b

# Make extension
def extend(source):
    f = fc.ActiveDocument.addObject("Part::FeaturePython", source.Name+'__extend')
    curveExtendFP.extend(f)
    f.Edge = (source,'Edge1')
    f.LengthStart = 1 # increase this if fuse points for front view are not found
    f.LengthEnd = 1  # increase this if fuse points for front view are not found
    curveExtendFP.extendVP(f.ViewObject)
    wireframe_style(f)
    f.recompute()
    return f

# Make extrusion
def extrude(source, dir=v(0,0,0), length=1000, symmetric=False):
    f = fc.ActiveDocument.addObject("Part::Extrusion", source.Name+'__extrude')
    f.Base = source
    f.DirMode = 'Normal'
    if dir.Length > 0:
        f.DirMode = 'Custom'
        f.Dir = dir
    f.Dir = dir
    f.LengthFwd = length
    f.Symmetric = symmetric
    f.recompute()
    return f

# Mix front and side view curves 
def mix_curve(baseline, profile, name='untitled', profile_dir=v(0,0,1)):
    mc = fc.ActiveDocument.addObject("Part::FeaturePython", name+'__mix')
    mixed_curve.MixedCurveFP(mc, baseline, profile, v(1,0,0), profile_dir)
    mixed_curve.MixedCurveVP(mc.ViewObject)
    #fc.ActiveDocument.recompute()
    wireframe_style(mc)
    mc.recompute()
    return mc


# Join curves of source into one curve
def join_curve(source, dir='', visibility=False):
    source.Visibility = False # For GUI
    curve = fc.ActiveDocument.addObject("Part::FeaturePython", source.Name+'__join')
    JoinCurves.join(curve)
    approximate_extension.ApproximateExtension(curve)
    JoinCurves.joinVP(curve.ViewObject) # for GUI?
    if dir=='Y': curve.Reverse = source.Shape.Vertexes[0].Y > source.Shape.Vertexes[-1].Y
    if dir=='Z': curve.Reverse = source.Shape.Vertexes[0].Z > source.Shape.Vertexes[-1].Z
    curve.Active = True # Approximate curve. Needed for smoothness and stability of gordon surface
    curve.ApproxTolerance = 0.2
    curve.Base = source
    wireframe_style(curve)
    curve.Visibility = visibility
    curve.recompute()
    return curve


# Make a new curve from a list of points
def make_curve(points, name='untitled', dir='', visibility=False):
    #name = name + '__poly'
    poly = fc.ActiveDocument.addObject("Part::Feature", name+'__poly')
    poly.Shape = Part.Wire(Part.makePolygon(points)) ######################3  Use Curves WB Interpolate instead of making poly and join
    poly.Visibility = False
    curve = join_curve(poly, dir=dir, visibility=visibility)
    return curve


# Make discrete object with evenly spaced points along source
def discretize(source,point_count):
    discrete = fc.ActiveDocument.addObject("Part::FeaturePython",source.Name+'__points')
    Discretize.Discretization(discrete, (source,'Edge1'))
    if point_count > 0:
        discrete.Algorithm = 'QuasiNumber'
        discrete.Number = point_count
    else:
        discrete.Algorithm = 'Angular-Curvature'
    Discretize.ViewProviderDisc(discrete.ViewObject) # For GUI
    discrete.ViewObject.PointSize = 3.00000 # For GUI
    discrete.Visibility = False # For GUI
    discrete.recompute()
    return discrete


# Get the name that is common to baseline and profile by removing all 'path' and 'type' information
def shared_name(obj):
    return (obj.Name
        # Used like directory path:
        .replace('side_view__','')
        .replace('top_view__','')
        .replace('front_view__','')
        .replace('back_view__','')
        .replace('right__','') # found in front view 
        .replace('left__','') # found in front view
        # Used like file types:
        .replace('_baseline','') 
        .replace('_profile','')
        )


def transform(obj, translate=v(0,0,0), rotate=(v(1,0,0),0), scale=1): # use_center=False
    shp = obj.Shape.copy()
    shp.translate(translate)
    shp.rotate(v(0,0,0),rotate[0],rotate[1])
    shp.scale(scale)
    obj.Shape = shp


def wireframe_style(obj):
    obj.ViewObject.LineWidth = 2
    obj.ViewObject.LineColor = (1.0,1.0,1.0)
    obj.ViewObject.Transparency = 100






              #  joined_profile = join_curve(profile)
              #  edge = joined_profile.Shape
              #  x1 = 0#v(0,100000,0)
              #  x2 = 0#v(0,100000,0)
              #  bb = joined_profile.Shape.BoundBox
              #  #print(bb.Center)
              #  seg_length = (edge.Length/500)
              #  for i in range(int(edge.FirstParameter), int(edge.LastParameter*500)):
              #      p = edge.valueAt(i/500)
              #      #if abs(p.y-bb.Center.y) < x1.y:
              #      #    x2 = x1
              #      #    x1 = p
              #      #print(p)
              #      if p.x < bb.Center.x and abs(p.y-bb.Center.y) < seg_length/2:
              #          x1 = p.x
              #          print('x1: '+str(x1))
              #      if p.x > bb.Center.x and abs(p.y-bb.Center.y) < seg_length/2:
              #          x2 = p.x
              #          print('x2: '+str(x2))
              #  profile_length = abs(x1-x2)

                #joined_baseline = join_curve(baseline)
                #bvy = joined_baseline.Shape.Vertexes[0].Y
                #blc = joined_baseline.Shape.BoundBox.Center
                #pc = profile.Shape.BoundBox.Center




#abs(mi - dpc/2)*2 / dpc # 1 when close to fuse point and 0 when inbetween
                        #x = lmp.x/m_box.x*f_box.x*ratio# + lmp.x*(1-ratio) # Use ratio to blend between fuse space and profile space
                        #z = lmp.z/m_box.z*f_box.z#*(ratio) + lmp.z*(1-ratio)
                        #ap = f_start + v(x, lmp.y/m_box.y*f_box.y, lmp.z/m_box.z*f_box.z)



#def sort_fp(f_point): return f_point.z 
            #f_points[bi].sort(reverse=(discrete_baseline.Points[0].z > discrete_baseline.Points[-1].z), key=sort_fp)


    #curve = join_curve(source,source.Name)
    #curve.Visibility = False # For GUI


    #def delete(self, obj):
        #if hasattr(obj,'Objects'): # If it has Objects, it is a clone and the source object must be deleted
        #    self.doc.removeObject(obj.Objects[0].Name)
    #    self.doc.removeObject(obj.Name)


#points = []
#print('baseline start index: '+str(bi))
#for d in range(2): # Go along baseline one way and then back the other to finish the profile loop
#    for n in baseline.Points:
#        if bi == 0 or bi == len(baseline.Points)-1: # fuse point:
#            points.append(  v(profile.Points[pi].x, baseline.Points[bi].y, baseline.Points[bi].z)  ) 
#        else: # regular point:
#            points.append(  v(profile.Points[pi].x, (baseline.Points[bi].y+profile.Points[pi].y)/2, baseline.Points[bi].z)  ) 
#        bi = bi + baseline_dir
#        pi = pi + 1
#        if pi >= len(profile.Points): pi = 0 # loop profile index
#    bi = max(0,min(bi,len(baseline.Points)-1)) # clamp baseline index
#    baseline_dir = -baseline_dir
#points.insert(epc,v(points[epc-1].x-dist_between_points/2, points[epc-1].y, points[epc-1].z))
#points.insert(0,v(points[0].x-dist_between_points/2, points[0].y, points[0].z))
#epc += 2
#f_points[0].append(points[epc-1]) # front fuse point
#f_points[1].append(points[0]) # back fuse point
#make_curve(points[:epc],shared_name(obj)+'_right')
#left_points = points[epc-1:]
#left_points.append(points[0])
#make_curve(left_points,shared_name(obj)+'_left')




#fob = int(points[0].y < points[epc-1].y) # started front or back


#x = 0
#fused = False
#for fb_point in f_points[i]:
#    dist = (v(0,p.y,p.z) - v(0,fb_point.y,fb_point.z)).Length
#    if dist < 1: # mm
#        points.append(fb_point)
#        fused = True
#        break
#    x += (fb_point.x-last_x) * 1/(dist + 1) # baseline endpoint hardly affects x when it is far away
#if fused == False:
#    points.append(v(x, p.y, p.z))



    #def svg_base(self, svg_path, base, target_plane, scale):
    #    xml.sax.parse(svg_path, self.svg_handler)
    #    new_base = self.doc.Objects[-1]
    #    self.delete(base.Base)
    #    new_base.Visibility = False
    #    shp = new_base.Shape.copy()
    #    if target_plane == 'xy':
    #        shp.rotate(v(0,0,0), v(0,0,1), 90)
    #    if target_plane == 'yz':
    #        shp.rotate(v(0,0,0), v(1,1,1), 120)
    #    new_base.Shape = shp
    #    new_base_clone = Draft.make_clone(new_base, forcedraft=True)
    #    new_base_clone.Scale = scale
    #    base.Base = new_base_clone 



#def b_curve(points):
#   geomCurve = Part.BezierCurve()
#   geomCurve.setPoles(points)
#   edge = Part.Edge(geomCurve)
#   return(edge)

#curve = fc.ActiveDocument.addObject("Part::FeaturePython", shared_name(obj)+'__curve')
                    #approximate.Approximate(curve, poly)
                    #approximate.ViewProviderApp(curve.ViewObject)
                    #approximate.Closed = True
                    #fit.Shape = b_curve(points[:20])


#clone = Draft.make_clone(obj, forcedraft=True)
    #clone.Scale = scale
    #self.doc.recompute()
    #sketch = Draft.make_sketch(obj, name = obj.Name + '__sketch')
    #sketch = Draft.rotate(sketch, rotate[0], v(0,0,0), rotate[1])
    #self.doc.recompute()
    #self.delete(clone)
    #self.doc.recompute()
    #sketch = Draft.scale(sketch, scale)
    #self.doc.recompute()
    #obj.Name = 'original_' + obj.Name
    #clone.Name = clone.Name[:-3]

    #shp = obj.Shape.copy()
    #shp.rotate(v(0,0,0), rotate[0], rotate[1])
    #obj.Shape = shp


#def latest(self):
#        latest_objects = list(set(self.doc.Objects) - set(self.objects))
#        self.objects = self.doc.Objects
#        return latest_objects

#def vect(v):
#    return fc.Vector(v[0],v[1],v[2])

# https://forum.freecadweb.org/viewtopic.php?t=16110
#def rotate(axis, angle):
#    axis = vect(axis)
#    origin = fc.Vector(0,0,0)
#    local_cs = fc.Placement(origin, fc.Rotation(fc.Vector(0,0,1), axis))
#    return local_cs.multiply(fc.Placement(fc.Vector(),fc.Rotation(angle,0,0)).multiply(local_cs.inverse()))
