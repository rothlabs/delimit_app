from . import get
import random, string
import FreeCAD

def random_id():
    return ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(4))

# Get the name that is common to baseline and profile by removing all 'path' and 'type' information
def shared_name(obj):
    return (obj.Label
        .replace('right_view__','')
        .replace('top_view__','')
        .replace('front_view__','')
        .replace('back_view__','')
        .replace('right__','') 
        .replace('left__','') 
        .replace('_baseline','') 
        .replace('_profile','')
        )

# Get the corresponding baseline to the given profile
def baseline(raw_parts, profile):
    for obj in raw_parts:
        if 'baseline' in obj.Label:
            sn = shared_name(obj) 
            if sn == shared_name(profile):
                return obj, sn
    raise Exception("No baseline found for: "+profile.Label+'. Add a matching baseline in the drawing (baselines go in right view).')

# Get a FreeCAD object by path and exact label
def obj(path):
    list_path = path.split('/')
    def search(objects):
        for o in objects:
            if o.Label == list_path[0]:
                if len(list_path) > 1:
                    list_path.pop(0)
                    return search(o.OutList)
                else: 
                    return o
        print("No object found for path: "+path)
    return search(FreeCAD.ActiveDocument.RootObjects)

def baselines(raw_parts):
    baselines = []
    for obj in raw_parts:
        if 'baseline' in obj.Label: baselines.append(obj)
    baselines.sort(key = lambda b: b.Shape.BoundBox.YMin)
    return {
        'lowest': baselines[0],
        'front':  get.obj('right_view__front_baseline'),
        'back':   get.obj('right_view__back_baseline'),
        'rim':    get.obj('right_view__rim_baseline'),
    }