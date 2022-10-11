import FreeCAD as fc # From FreeCAD
import Part # From FreeCAD
from importSVG import svgHandler # From FreeCAD
import MeshPart, Mesh # From FreeCAD
from Curves import JoinCurves, approximate_extension, Discretize, approximate # From FreeCAD external workbench
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
        xml.sax.parse(path, self.svg_handler)
        sf = self.depth / self.get('side_view__profile').Shape.BoundBox.XLength
        tf = -self.get('side_view__profile').Shape.BoundBox.Center
        for obj in self.doc.Objects:
            wireframe_style(obj)
            if 'side_view' in obj.Label: 
                transform(obj, translate=tf, rotate=(v(1,1,1),120), scale=sf)
        for obj in self.doc.Objects:
            if 'top_view' in obj.Label:
                if 'profile' in obj.Label:
                    baseline = self.baseline(obj)
                    transform(obj, rotate = (v(0,0,1),90), scale = baseline.Shape.BoundBox.YLength/obj.Shape.BoundBox.XLength)
                    transform(obj, translate = baseline.Shape.BoundBox.Center - obj.Shape.BoundBox.Center)
                    profile = discretize(obj, 120)
                    baseline = discretize(baseline, 60)
                    #self.doc.recompute()
                    points = []
                    bi = 0 # baseline start index
                    baseline_dir = 1
                    if baseline.Points[0].y < baseline.Points[-1].y:
                        bi = len(baseline.Points)-1
                        baseline_dir = -1
                    close_i1 = 0
                    close_i2 = 0
                    for i, p in enumerate(profile.Points):
                        if abs(p.x) < abs(profile.Points[close_i1].x):
                            close_i2 = close_i1
                            close_i1 = i
                    pi = close_i1 # profile start index
                    if (profile.Points[close_i2]-baseline.Points[bi]).Length < (profile.Points[close_i1]-baseline.Points[bi]).Length:
                        pi = close_i2
                    for d in range(2):#range(baseline_dir,-baseline_dir, -baseline_dir*2):
                        for n in baseline.Points:
                            points.append(v(profile.Points[pi].x, (baseline.Points[bi].y+profile.Points[pi].y)*.5, baseline.Points[bi].z))
                            bi = bi + baseline_dir
                            pi = pi + 1
                            if pi >= len(profile.Points):
                                pi = 0
                        if bi >= len(baseline.Points):
                            bi = len(baseline.Points)-1
                        if bi < 0:
                            bi = 0
                        baseline_dir = -baseline_dir
                    points.append(points[-1])
                    poly = self.doc.addObject("Part::Feature", common_name(obj)+'__poly')
                    poly.Shape = Part.Wire(Part.makePolygon(points))
                    poly.Visibility = False
                    curve = fc.ActiveDocument.addObject("Part::FeaturePython", common_name(obj)+'__curve')
                    approximate.Approximate(curve, poly)
                    approximate.ViewProviderApp(curve.ViewObject)
                    #fit.Shape = b_curve(points[:20])
        
    def baseline(self,profile):
        for obj in self.doc.Objects:
            if 'baseline' in obj.Label:
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

    def svg_base(self, svg_path, base, target_plane, scale):
        xml.sax.parse(svg_path, self.svg_handler)
        new_base = self.doc.Objects[-1]
        self.delete(base.Base)
        new_base.Visibility = False
        shp = new_base.Shape.copy()
        if target_plane == 'xy':
            shp.rotate(v(0,0,0), v(0,0,1), 90)
        if target_plane == 'yz':
            shp.rotate(v(0,0,0), v(1,1,1), 120)
        new_base.Shape = shp
        new_base_clone = Draft.make_clone(new_base, forcedraft=True)
        new_base_clone.Scale = scale
        base.Base = new_base_clone 


#def b_curve(points):
#   geomCurve = Part.BezierCurve()
#   geomCurve.setPoles(points)
#   edge = Part.Edge(geomCurve)
#   return(edge)


def discretize(obj,point_count):
    joinCurve = fc.ActiveDocument.addObject("Part::FeaturePython", "JoinCurve")
    JoinCurves.join(joinCurve)
    approximate_extension.ApproximateExtension(joinCurve)
    JoinCurves.joinVP(joinCurve.ViewObject) # for GUI?
    joinCurve.Base = obj
    joinCurve.recompute()
    points_obj = fc.ActiveDocument.addObject("Part::FeaturePython",obj.Label+'__points')
    Discretize.Discretization(points_obj, (joinCurve,'Edge1'))
    points_obj.Number = point_count
    Discretize.ViewProviderDisc(points_obj.ViewObject) # For GUI
    points_obj.ViewObject.PointSize = 3.00000 # For GUI
    joinCurve.Visibility = False # For GUI
    obj.Visibility = False # For GUI
    points_obj.recompute()
    return points_obj

# Get the name that is common to baseline and profile
def common_name(obj):
    return (obj.Label
        .replace('side_view__','')
        .replace('top_view__','')
        .replace('_baseline','')
        .replace('_profile','')
        .replace('__points',''))

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
