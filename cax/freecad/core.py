'''
Provides core functionality for generating product models from drawings.
Most objects are created with a bread-crumb naming scheme to make everything explicit in the FreeCAD Tree View.
If an object has 001, 002, etc at the end of the its name, there might be unnecessary dubplicated generation.
The drawing SIDE view contains BASELINES and the TOP & FRONT views contain PROFILES. Baselines and profiles are mixed to generate 3D curves.
'''

import FreeCAD as fc # From FreeCAD
import Mesh, Part, MeshPart # From FreeCAD
from importSVG import svgHandler # From FreeCAD
from Curves import JoinCurves, approximate_extension, Discretize, mixed_curve, curveExtendFP  # From https://github.com/tomate44/CurvesWB
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
            if 'side_view' in obj.Name: 
                transform(obj, translate=side_view_translate, rotate=(v(1,1,1),120), scale=side_view_scale)
            if 'material' in obj.Name:
                obj.Visibility = False

        # Build curves from TOP & SIDE views
        for obj in self.svg_parts:
            if 'top_view' in obj.Name and 'profile' in obj.Name:
                profile = obj
                baseline = self.baseline(profile)

                # Transform TOP view profiles
                transform(profile, rotate = (v(0,0,1),90), scale = (baseline.Shape.BoundBox.YLength-.5)/profile.Shape.BoundBox.XLength)
                transform(profile, translate = baseline.Shape.BoundBox.Center - profile.Shape.BoundBox.Center)
                
                # This section preps information for generating mixed curves from TOP & SIDE views
                joined_profile = join_curve(profile)
                joined_baseline = join_curve(baseline)
                dpc = 60 # discretize point count
                profile_points = discretize(joined_profile, dpc*2).Points
                baseline_points = discretize(joined_baseline, dpc).Points
                bi = 0 # baseline index
                baseline_dir = 1
                if baseline_points[0].y < baseline_points[-1].y:
                    bi = len(baseline_points)-1
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
                dist_between_points = profile.Shape.Length / (dpc*2)
                m_points = [] # mixed points
                p_points = [] # profile points

                # This for loop goes up and down the baseline to gather point data from baseline and profile
                for d in range(2): 
                    for n in baseline_points:
                        if bi == 0 or bi == len(baseline_points)-1: # fuse point:
                            m_points.append(  v(profile_points[pi].x, baseline_points[bi].y, baseline_points[bi].z)  ) 
                        else: # regular point:
                            m_points.append(  v(profile_points[pi].x, (baseline_points[bi].y+profile_points[pi].y)/2, baseline_points[bi].z)  ) 
                        p_points.append(profile_points[pi])
                        #if bi < len(baseline.Points): b_points.append(baseline[bi])
                        bi = bi + baseline_dir
                        pi = pi + 1
                        if pi >= len(profile_points): pi = 0 # loop profile index
                    bi = max(0,min(bi,len(baseline_points)-1)) # clamp baseline index
                    baseline_dir = -baseline_dir

                test_mix = mix_curve(joined_baseline, joined_profile)
                if len(test_mix.Shape.Edges) == 1: # only use mix_curve if 1 edge produced
                    # This section creates a perfect mixed curve from TOP & SIDE view (requires function-of-(x or z) source curves)
                    p_right = make_curve(p_points[:dpc], name=profile.Name+'__right') # Remove common name?
                    left_points = p_points[dpc-1:]
                    left_points.append(p_points[0])
                    p_left = make_curve(left_points, name=profile.Name+'__left', reverse=True)
                    curves.append(mix_curve(joined_baseline, p_right, name=common_name(profile)+'__right'))
                    curves.append(mix_curve(joined_baseline, p_left, name=common_name(profile)+'__left'))
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
                    curves.append(make_curve(m_points[:dpc], name=common_name(profile)+'__right', visibility=True))
                    left_points = m_points[dpc-1:]
                    left_points.append(m_points[0])
                    curves.append(make_curve(left_points, name=common_name(profile)+'__left', reverse=True, visibility=True))
                self.doc.removeObject(test_mix.Name)
        
        # Build the front and back curves so they hit all the fuse points at the curves that were mixed from TOP & SIDE
        def sort_fp(f_point):
            return f_point.z 
        for fb,e in enumerate([front_baseline,back_baseline]):
            e = discretize(join_curve(e), 100) 
            f_points[fb].sort(reverse=(e.Points[0].z > e.Points[-1].z), key=sort_fp)
            points = []
            fbi = 0
            last_i = 0
            for i, p in enumerate(e.Points):
                dist = (v(0,p.y,p.z) - v(0,f_points[fb][fbi].y,f_points[fb][fbi].z)).Length
                if dist < 1: # fuse when within 1 mm
                    points.append(f_points[fb][fbi])
                    if len(points)>1:
                        curves.append(make_curve(points, name=common_name(e)+'__s'+str(last_i)+'_e'+str(i), visibility=True))
                        last_i = i
                        points.clear()
                        points.append(f_points[fb][fbi])
                    fbi += 1
                    if fbi >= len(f_points[fb]):
                        break
                    else:
                        fb_dist = (v(0,f_points[fb][fbi-1].y,f_points[fb][fbi-1].z) - v(0,f_points[fb][fbi].y,f_points[fb][fbi].z)).Length
                else: 
                    ratio = dist / fb_dist
                    x = f_points[fb][fbi].x*(1-ratio) + f_points[fb][fbi-1].x*ratio
                    points.append(v(x, p.y, p.z))
        
        # Build curves from FRONT & SIDE views
        f_points = []
        fv_baselines = {}
        for obj in self.svg_parts:
            if 'front_view' in obj.Name and 'profile' in obj.Name:
                profile = obj
                baseline = self.baseline(profile)

                # Transform front view profiles
                transform(profile, rotate = (v(1,0,0),90), scale = (baseline.Shape.BoundBox.ZLength)/profile.Shape.BoundBox.YLength)
                transform(profile, translate = baseline.Shape.BoundBox.Center - profile.Shape.BoundBox.Center)

                if not common_name(profile) in fv_baselines:
                    fv_baselines[common_name(profile)] = join_curve(baseline)
                    extended_baseline = extend(baseline) 
                    surface_baseline = extrude(extended_baseline, symmetric=True) 
                    block_baseline = extrude(surface_baseline, dir=v(0,1,0), length=1) 
                    for curve in curves:
                        intersection = intersect(block_baseline, curve) 
                        verts = intersection.Shape.Vertexes
                        if len(verts) > 1:
                            f_points.append(verts[int(verts[0].Y > verts[1].Y)].Point) # Add the point with lowest y value to fuse point list
                        self.doc.removeObject(intersection.Name)
                        curve.Visibility = True
                    self.doc.removeObject(block_baseline.Name)
                    self.doc.removeObject(surface_baseline.Name)
                    self.doc.removeObject(extended_baseline.Name)
        print(len(f_points))

        # Make front view curves 
        #for obj in self.svg_parts:
           # if 'front_view' in obj.Name and 'profile' in obj.Name:
            #    baseline_svg = self.baseline(obj)

                # Transform front view profiles
                #transform(obj, rotate = (v(1,0,0),90), scale = (baseline_svg.Shape.BoundBox.ZLength)/obj.Shape.BoundBox.YLength)
                #transform(obj, translate = baseline_svg.Shape.BoundBox.Center - obj.Shape.BoundBox.Center)

                #suffix = 'left'
                #if 'right' in obj.Name: suffix = '__right'
                #baseline = join_curve(baseline_svg,baseline_svg.Name, visibility=True)
                #profile = join_curve(obj,obj.Name, visibility=True)
                #mix = mix_curve(baseline, profile, profile_dir=v(0,1,0))
                


    # Get the corresponding baseline to the given profile.
    def baseline(self,profile):
        for obj in self.svg_parts:
            if 'baseline' in obj.Name:
                if common_name(obj) == common_name(profile):
                    return obj

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
    f.LengthStart = 2 # increase this if fuse points for front view are not found
    f.LengthEnd = 2  # increase this if fuse points for front view are not found
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
def join_curve(source, reverse=False, visibility=False):
    source.Visibility = False # For GUI
    curve = fc.ActiveDocument.addObject("Part::FeaturePython", source.Name+'__join')
    JoinCurves.join(curve)
    approximate_extension.ApproximateExtension(curve)
    JoinCurves.joinVP(curve.ViewObject) # for GUI?
    curve.Reverse = reverse
    curve.Active = True # Approximate curve. Needed for smoothness and stability of gordon surface
    curve.ApproxTolerance = 0.2
    curve.Base = source
    wireframe_style(curve)
    curve.Visibility = visibility
    curve.recompute()
    return curve


# Make a new curve from a list of points
def make_curve(points, name='untitled', reverse=False, visibility=False):
    #name = name + '__poly'
    poly = fc.ActiveDocument.addObject("Part::Feature", name+'__poly')
    poly.Shape = Part.Wire(Part.makePolygon(points))
    poly.Visibility = False
    curve = join_curve(poly,reverse=reverse,visibility=visibility)
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
def common_name(obj):
    return (obj.Name
        # Used like directory path:
        .replace('side_view__','')
        .replace('top_view__','')
        .replace('front_view__','')
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
#make_curve(points[:epc],common_name(obj)+'_right')
#left_points = points[epc-1:]
#left_points.append(points[0])
#make_curve(left_points,common_name(obj)+'_left')




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

#curve = fc.ActiveDocument.addObject("Part::FeaturePython", common_name(obj)+'__curve')
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
