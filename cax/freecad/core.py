import FreeCAD as fc # From FreeCAD
import Part # From FreeCAD
from importSVG import svgHandler # From FreeCAD
import MeshPart, Mesh # From FreeCAD
from Curves import JoinCurves, approximate_extension, Discretize, mixed_curve  # From FreeCAD external workbench
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
        epc = 60 # edge point count
        xml.sax.parse(path, self.svg_handler)
        front_edge = self.get('side_view__front_edge')
        back_edge = self.get('side_view__back_edge')
        insole_edge = self.get('side_view__insole_edge')
        insole_edge.Visibility = False
        sf = self.depth / front_edge.Shape.BoundBox.XLength
        tf = -front_edge.Shape.BoundBox.Center
        f_points = [[],[]] # front and back fuse points
        for obj in self.doc.Objects:
            if 'side_view' in obj.Label: 
                transform(obj, translate=tf, rotate=(v(1,1,1),120), scale=sf)
            if 'material' in obj.Label:
                obj.Visibility = False
        for obj in self.doc.Objects:
            if 'top_view' in obj.Label:
                if 'profile' in obj.Label:
                    baseline = self.baseline(obj)
                    transform(obj, rotate = (v(0,0,1),90), scale = baseline.Shape.BoundBox.YLength/obj.Shape.BoundBox.XLength)
                    transform(obj, translate = baseline.Shape.BoundBox.Center - obj.Shape.BoundBox.Center)
                    profile = discretize(obj, epc*2)
                    baseline = discretize(baseline, epc)
                    bi = 0 # baseline index
                    baseline_dir = 1
                    if baseline.Points[0].y < baseline.Points[-1].y:
                        bi = len(baseline.Points)-1
                        baseline_dir = -1
                    close_i1 = 0
                    close_i2 = 0
                    for i, p in enumerate(profile.Points): # Get the profile indecies that are closest to start and end points of baseline
                        if abs(p.x) < abs(profile.Points[close_i1].x):
                            close_i2 = close_i1
                            close_i1 = i
                    pi = close_i1 # profile index
                    if (profile.Points[close_i2]-baseline.Points[bi]).Length < (profile.Points[close_i1]-baseline.Points[bi]).Length:
                        pi = close_i2
                    dist_between_points = obj.Shape.Length / (epc*2)
                    points = []
                    print('baseline start index: '+str(bi))
                    for d in range(2): # Go along baseline one way and then back the other to finish the profile loop
                        for n in baseline.Points:
                            if bi == 0 or bi == len(baseline.Points)-1: # fuse point:
                                points.append(  v(profile.Points[pi].x, baseline.Points[bi].y, baseline.Points[bi].z)  ) 
                            else: # regular point:
                                points.append(  v(profile.Points[pi].x, (baseline.Points[bi].y+profile.Points[pi].y)/2, baseline.Points[bi].z)  ) 
                            bi = bi + baseline_dir
                            pi = pi + 1
                            if pi >= len(profile.Points): pi = 0 # loop profile index
                        bi = max(0,min(bi,len(baseline.Points)-1)) # clamp baseline index
                        baseline_dir = -baseline_dir
                    points.insert(epc,v(points[epc-1].x-dist_between_points/2, points[epc-1].y, points[epc-1].z))
                    points.insert(0,v(points[0].x-dist_between_points/2, points[0].y, points[0].z))
                    epc += 2
                    f_points[0].append(points[epc-1]) # front fuse point
                    f_points[1].append(points[0]) # back fuse point
                    make_curve(points[:epc],common_name(obj)+'_right')
                    left_points = points[epc-1:]
                    left_points.append(points[0])
                    make_curve(left_points,common_name(obj)+'_left', reverse=True)
        def sort_fb(fb_point):
            return fb_point.z 
        for fb,e in enumerate([front_edge,back_edge]):
            e = discretize(e, 0) 
            f_points[fb].sort(reverse=(e.Points[0].z > e.Points[-1].z), key=sort_fb)
            points = []
            fbi = 0
            for p in e.Points:
                dist = (v(0,p.y,p.z) - v(0,f_points[fb][fbi].y,f_points[fb][fbi].z)).Length
                if dist < 1: # mm
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
            make_curve(points,common_name(e))
        
    # Get the corresponding edge to the given profile. Calling the 'edge' as 'baseline' as to not be confused with FreeCAD edges
    def baseline(self,profile):
        for obj in self.doc.Objects:
            if 'edge' in obj.Label:
                if common_name(obj) == common_name(profile):
                    return obj

    def get(self, path):
        path = path.split('/')
        def search(objects):
            for obj in objects:
                if obj.Label == path[0]:
                    if len(path) > 1:
                        path.pop(0)
                        return search(obj.OutList)
                    else: 
                        return obj
        return search(self.doc.RootObjects)

    def delete(self, obj):
        if hasattr(obj,'Objects'): # If it has Objects, it is a clone and the source object must be deleted
            self.doc.removeObject(obj.Objects[0].Name)
        self.doc.removeObject(obj.Name)

    def export(self,product_id):
        self.doc.recompute() # need to check for unexpected zero volume and report failure
        shp = self.shape.Shape.copy()
        shp.rotate(v(0,0,0), v(1,0,0), -90)
        self.mesh.Mesh = MeshPart.meshFromShape(shp, LinearDeflection=0.08, AngularDeflection=0.15, Relative=False)
        self.mesh.recompute()
        Mesh.export([self.mesh],'../tmp/'+str(product_id)+'.obj')

# Mix front and side view curves 
def mix_curve(baseline,profile):
    mc = fc.ActiveDocument.addObject("Part::FeaturePython", "Mixed curve")
    mixed_curve.MixedCurveFP(mc, baseline, profile, v(1,0,0), v(0,0,1))
    approximate_extension.ApproximateExtension(mc)
    mc.Active = True
    mc.ApproxTolerance = 0.5
    mixed_curve.MixedCurveVP(mc.ViewObject)
    fc.ActiveDocument.recompute()
    mc.recompute()
    if len(mc.Edges) > 1: # Do not use mixed curve if more than one edge is produced
        return False
    return mc

# Join curves of source into one curve
def join_curve(source, name, reverse=False):
    source.Visibility = False # For GUI
    curve = fc.ActiveDocument.addObject("Part::FeaturePython", name+'__curve')
    JoinCurves.join(curve)
    approximate_extension.ApproximateExtension(curve)
    JoinCurves.joinVP(curve.ViewObject) # for GUI?
    curve.Reverse = reverse
    curve.Active = True # Approximate curve. Needed for smoothness and stability of gordon surface
    curve.ApproxTolerance = 0.5
    curve.Base = source
    wireframe_style(curve)
    curve.recompute()
    return curve

# Make a new curve from a list of points
def make_curve(points, name, reverse=False):
    name = name + '__poly'
    poly = fc.ActiveDocument.addObject("Part::Feature", name)
    poly.Shape = Part.Wire(Part.makePolygon(points))
    poly.Visibility = False
    curve = join_curve(poly,name,reverse)

# Make discrete object with evenly spaced points along source
def discretize(source,point_count):
    curve = join_curve(source,source.Label)
    curve.Visibility = False # For GUI
    discrete = fc.ActiveDocument.addObject("Part::FeaturePython",source.Label+'__points')
    Discretize.Discretization(discrete, (curve,'Edge1'))
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

# Get the name that is common to baseline and profile
def common_name(obj):
    return (obj.Label
        .replace('side_view__','')
        .replace('top_view__','')
        .replace('_edge','')
        .replace('_profile',''))

def transform(obj, translate=v(0,0,0), rotate=(v(1,0,0),0), scale=1):
    shp = obj.Shape.copy()
    shp.translate(translate)
    shp.rotate(v(0,0,0),rotate[0],rotate[1])
    shp.scale(scale)
    obj.Shape = shp

def wireframe_style(obj):
    obj.ViewObject.LineWidth = 2
    obj.ViewObject.LineColor = (1.0,1.0,1.0)
    obj.ViewObject.Transparency = 100






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
    #sketch = Draft.make_sketch(obj, name = obj.Label + '__sketch')
    #sketch = Draft.rotate(sketch, rotate[0], v(0,0,0), rotate[1])
    #self.doc.recompute()
    #self.delete(clone)
    #self.doc.recompute()
    #sketch = Draft.scale(sketch, scale)
    #self.doc.recompute()
    #obj.Label = 'original_' + obj.Label
    #clone.Label = clone.Label[:-3]

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
