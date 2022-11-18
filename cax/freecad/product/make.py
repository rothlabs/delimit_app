import config
import FreeCAD, FreeCADGui, Mesh, Part, MeshPart # From FreeCAD
from Curves import JoinCurves, approximate_extension, Discretize, mixed_curve, curveExtendFP, splitCurves_2  # From https://github.com/tomate44/CurvesWB

v = FreeCAD.Vector

def default_name(obj, source, name): obj.Label = name + '__'+obj.Label
def direct_name(obj, source, name):  obj.Label = name
def crumb_name(obj, source, name):   
    if isinstance(source, list): default_name(obj, source, name)
    else: obj.Label = source.Label + '__'+obj.Label

def wireframe_style(obj):
    if hasattr(FreeCADGui,'addCommand'):
        obj.ViewObject.LineWidth = 2
        obj.ViewObject.LineColor = (1.0,1.0,1.0)
        obj.ViewObject.Transparency = 100

def make_freecad_object(fc_type, namer=default_name, vis=False):
    def wrap(func):
        def wrapped_func(*args, name='', vis=vis, **kwargs):
            obj = FreeCAD.ActiveDocument.addObject(fc_type, func.__name__)
            obj.Visibility = vis
            namer(obj, args[0], name)
            final = func(obj, *args, **kwargs)
            obj.recompute()
            if hasattr(obj,'Shape') and len(obj.Shape.Faces) < 1: wireframe_style(obj)
            if final: return final
            return obj
        return wrapped_func
    return wrap

def mapped(points, start_point, end_point, name, dir='Z'):
    a_points = [start_point] # adjusted points
    for mi, mp in enumerate(points): 
        lps = mp - points[0] # mixed point local to start
        lpe = mp - points[-1] # mixed point local to end
        ratio = mi / (len(points)-1)
        a_points.append( (start_point + lps)*(1-ratio) + (end_point + lpe)*ratio )
    a_points.append(end_point)
    return curve(a_points, dir=dir, name=name)

@make_freecad_object('Mesh::Feature')
def mesh(obj, source):
    shp = source.Shape.copy()
    shp.rotate(v(0,0,0), v(1,0,0), -90)
    obj.Mesh = MeshPart.meshFromShape(shp, LinearDeflection=0.08, AngularDeflection=0.15, Relative=False)

@make_freecad_object('Part::Feature')
def curve(obj, points, dir=''):
    obj.Shape = Part.Wire(Part.makePolygon(points)) 
    return join(obj, dir=dir, vis=obj.Visibility) # Use Curves WB Interpolate instead of joining? Will it be smoother?

@make_freecad_object('Part::FeaturePython')
def mix(obj, baseline, profile, baseline_dir=v(1,0,0), profile_dir=v(0,0,1)):
    mixed_curve.MixedCurveFP(obj, baseline, profile, baseline_dir, profile_dir)
    if hasattr(FreeCADGui,'addCommand'): mixed_curve.MixedCurveVP(obj.ViewObject)

@make_freecad_object('Part::FeaturePython', crumb_name)
def join(obj, source, dir='', approx_tolerance=config.approx_tolerance):
    JoinCurves.join(obj)
    approximate_extension.ApproximateExtension(obj)
    if hasattr(FreeCADGui,'addCommand'): JoinCurves.joinVP(obj.ViewObject) 
    obj.Active = True # Approximate curve. Needed for smoothness and stability of surfaces
    obj.ApproxTolerance = approx_tolerance
    if isinstance(source, list): obj.Edges = [(s[0],'Edge'+str(s[1]+1)) for s in source]
    else: obj.Base = source
    obj.recompute()
    if dir=='X': obj.Reverse = obj.Shape.Vertexes[0].X > obj.Shape.Vertexes[-1].X
    if dir=='Y': obj.Reverse = obj.Shape.Vertexes[0].Y > obj.Shape.Vertexes[-1].Y
    if dir=='Z': obj.Reverse = obj.Shape.Vertexes[0].Z > obj.Shape.Vertexes[-1].Z

@make_freecad_object('Part::Feature', direct_name)
def copy(obj, source):
    obj.Shape = source.Shape.copy()

@make_freecad_object('Part::Compound')
def compound(obj, links):
    obj.Links = links

@make_freecad_object('Part::Cut')
def cut(obj, base, tool):
    obj.Base = base
    obj.Tool = tool

@make_freecad_object('Part::MultiCommon')
def common(obj, shapes):
    obj.Shapes = shapes

@make_freecad_object('Surface::GeomFillSurface')
def surface(obj, boundaries):
    obj.BoundaryList = [(b[0],'Edge'+str(b[1]+1)) for b in boundaries]
    obj.FillType = 1

@make_freecad_object('Part::FeaturePython')
def split(obj, source, cutting_objects):
    splitCurves_2.split(obj, (source,'Edge1'))
    obj.Values = []
    obj.CuttingObjects = cutting_objects
    if hasattr(FreeCADGui,'addCommand'): 
        splitCurves_2.splitVP(obj.ViewObject)
        obj.ViewObject.PointSize = 5.0

@make_freecad_object('Part::Offset2D')
def offset(obj, source, dist=0):
    obj.Source = source
    obj.Value = dist
    obj.Mode = 'Skin'

@make_freecad_object('Part::FeaturePython')
def extend(obj, source, dist=0):
    curveExtendFP.extend(obj)
    obj.Edge = (source,'Edge1')
    if dist>0:
        obj.LengthStart = dist
        obj.LengthEnd = dist
    else: 
        obj.LengthStart = config.baseline_extension 
        obj.LengthEnd = config.baseline_extension 
    if hasattr(FreeCADGui,'addCommand'): curveExtendFP.extendVP(obj.ViewObject)

@make_freecad_object('Part::FeaturePython')
def discrete(obj, source, count=0):
    Discretize.Discretization(obj, (source,'Edge1'))
    if count > 0:
        obj.Algorithm = 'QuasiNumber'
        obj.Number = count
    else:
        obj.Algorithm = 'Angular-Curvature'
    if hasattr(FreeCADGui,'addCommand'): 
        Discretize.ViewProviderDisc(obj.ViewObject) 
        obj.ViewObject.PointSize = 3.0

@make_freecad_object('Part::Extrusion')
def extrude(obj, base, dir=v(0,0,0), dist=1, symmetric=False):
    obj.Base = base
    obj.DirMode = 'Normal'
    if dir.Length > 0:
        obj.DirMode = 'Custom'
        obj.Dir = dir
    obj.LengthFwd = dist
    obj.Symmetric = symmetric