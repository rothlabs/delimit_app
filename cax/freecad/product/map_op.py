import config
import FreeCAD
from . import make, get, mod
import math

v = FreeCAD.Vector

# Build the front and back mapped curves so they hit all the fuse points at the curves that were mixed from TOP & RIGHT
def build_front_back(curves, baselines, fuses, rim_fuse_front_right):
    mapped_front_right = False
    mapped_fronts = []
    for bi, baseline in enumerate([baselines['front'],baselines['back']]):
        discrete_baseline = make.discrete(make.join(baseline, dir='Z'), count=config.discrete_count)
        fuses[bi].sort(key=lambda p:p.z)
        if len(fuses[0]) < 1: raise Exception('No front fuse points. Check top view and related baselines.')
        if len(fuses[1]) < 1: raise Exception('No back fuse points. Check top view and related baselines.')
        points = []
        fuses_right = [fuses[0][-2]] # right branch to rim_fuse_front_right
        fi = 0 # fuse point index
        last_i = fi
        #last_point = discrete_baseline.Points[0]
        for i, p in enumerate(discrete_baseline.Points):
            dist = (v(0,p.y,p.z) - v(0,fuses[bi][fi].y,fuses[bi][fi].z)).Length
            if dist < config.fuse_tolerance_xy or (i==config.discrete_count-1 and fi == len(fuses[bi])-1):# or (bi==0 and split_index == 0): # fuse when within 1 mm
                points.append(fuses[bi][fi])
                if bi==0 and fi == len(fuses[bi])-1 and rim_fuse_front_right: # For front right branch:
                    fuses_right.append(rim_fuse_front_right)
                if len(points)>1:
                    curves.append(make.curve(points, name=discrete_baseline.Label+'__s'+str(last_i)+'_e'+str(i)))
                    if bi==0: 
                        mapped_fronts.append(curves[-1])
                        if fi == len(fuses[bi])-1 and rim_fuse_front_right: # For front right branch:
                            curves.append(make.curve(fuses_right, name=discrete_baseline.Label+'__s'+str(last_i)+'_e'+str(i)+'__r_branch'))
                            mapped_front_right = curves[-1]
                    last_i = i
                    points.clear()
                    points.append(fuses[bi][fi])
                fi += 1
                if fi > len(fuses[bi])-1:
                    break
                #if fi == len(fuses[bi])-2:
                #    last_point = points[-1]
                f_span = (v(0,fuses[bi][fi-1].y,fuses[bi][fi-1].z) - v(0,fuses[bi][fi].y,fuses[bi][fi].z)).Length
            else: 
                if bi==0 and fi == len(fuses[bi])-1: # last front segment:
                    ratio = (i - last_i) / (len(discrete_baseline.Points)-1 - last_i) # ratio based on index from last fuse to final fuse
                    x = fuses[bi][fi-1].x*(1-ratio) + fuses[bi][fi].x*ratio
                    ratio = math.pow(ratio,2)
                    le = p - discrete_baseline.Points[-1]  # point local to end
                    ap = p*(1-ratio) + (fuses[bi][fi] + le)*ratio
                    points.append(v(x, ap.y, ap.z))
                    if rim_fuse_front_right: # for front right branch:
                        x = fuses[bi][fi-1].x*(1-ratio) + rim_fuse_front_right.x*ratio
                        ap = p*(1-ratio) + (rim_fuse_front_right + le)*ratio
                        fuses_right.append(v(x, ap.y, ap.z))
                else: # other segments:
                    ratio = dist / f_span # ratio based on distance from fuse points
                    x = fuses[bi][fi-1].x*ratio + fuses[bi][fi].x*(1-ratio)
                    points.append(v(x, p.y, p.z))
    return mapped_fronts, mapped_front_right


# Build curves from FRONT, BACK, & RIGHT views 
def build_sides(raws, curves, mapped_fronts, mapped_front_right):
    doc = FreeCAD.ActiveDocument
    split_curves = [[],[]] # curves split by 'above' and 'below' cutters
    curves_to_append = []
    curves_to_remove = []
    for obj in raws:
        if ('front_view' in obj.Label or 'back_view' in obj.Label) and 'profile' in obj.Label and '__left__' in obj.Label:
            profiles = [obj, get.obj(obj.Label.replace('__left__','__right__'))] 
            baseline, shared_name = get.baseline(raws, obj)

            # Find fuse points
            fuses = [[],[]] # left and right fuse points
            curves_to_split = [[],[]]
            joined_baseline = make.join(baseline)
            extended_baseline = make.extend(joined_baseline) # extend to make sure it crosses approximated curves from RIGHT view perspective
            surface_baseline = make.extrude(extended_baseline, dir=v(1,0,0), dist=1000, symmetric=True) 
            solid_baseline = make.extrude(surface_baseline, dir=v(0,1,0), dist=1) # For some reason, intersect is not working with surfaces, so extrude surface as solid
            curves_points = [] # curves and points
            ax = 0 # average x
            for curve in curves:
                if not 'insole' in curve.Label:
                    intersection = make.common([solid_baseline, curve]) # USE BOOLIAN FRAGMENTS INSTEAD??? Or Part.Slice? (solid not needed?)
                    verts = intersection.Shape.Vertexes
                    if len(verts) > 1:
                        curves_points.append({'c':curve, 'p':verts[int(verts[0].Y > verts[1].Y)].Point}) # add point with lowest Y value
                        ax = ax + curves_points[-1]['p'].x
                    doc.removeObject(intersection.Name)
            ax = ax / len(curves_points)
            for cp in curves_points:
                if len(curves_points)<4 and ('front' in cp['c'].Label or 'back' in cp['c'].Label): # add fuse point to left AND right if on front or back edge curve
                    fuses[0].append(cp['p'])
                    fuses[1].append(cp['p'])
                    curves_to_split[0].append(cp['c'])
                else: 
                    fuses[int(cp['p'].x > ax)].append(cp['p']) 
                    curves_to_split[int(cp['p'].x > ax)].append(cp['c'])
            doc.removeObject(solid_baseline.Name)
            doc.removeObject(surface_baseline.Name)
            doc.removeObject(extended_baseline.Name)

            for pi, profile in enumerate(profiles):
                if profile == None: raise Exception('No profile for constructing from front view: '+str(profiles))
                if baseline == None: raise Exception('No baseline for constructing from front view: '+str(profiles))
                fuses[pi].sort(key=lambda p:p.z)
                if len(fuses[pi]) < 2: raise Exception('Less than 2 fuse points when building curve from: '+profile.Label+'. Try increasing LengthStart and LengthEnd in "extend" function')
                if len(fuses[pi]) > 2: raise Exception('More than 2 fuse points when building curve from: '+profile.Label+'. Try decreasing LengthStart and LengthEnd in "extend" function')
                # Transform front view profiles:
                mod.transform(profile, rotate = (v(1,0,0),90), scale = (baseline.Shape.BoundBox.ZLength)/profile.Shape.BoundBox.YLength)
                mod.transform(profile, translate = baseline.Shape.BoundBox.Center - profile.Shape.BoundBox.Center)
                # Mix curves:
                joined_profile = make.join(profile, dir='Z')
                suffix = '__left'
                if pi>0: suffix = '__right'
                mix = make.mix(joined_baseline, joined_profile, profile_dir=v(0,1,0), name=shared_name+suffix)
                joined_mix = make.join(mix, dir='Z') # joining to force direction to +Z
                dpc = config.discrete_count 
                discrete_mix = make.discrete(joined_mix, count=dpc) 
                a_points = [fuses[pi][0]] # adjusted points
                for mi, mp in enumerate(discrete_mix.Points): # TODO: Use map_curve here?
                    lmp = mp - discrete_mix.Points[0] # mixed point local to start
                    rlmp = mp - discrete_mix.Points[-1] # mixed point local to end
                    ratio = mi / dpc 
                    ap = (fuses[pi][0] + lmp)*(1-ratio) + (fuses[pi][1] + rlmp)*ratio
                    a_points.append(ap)
                a_points.append(fuses[pi][1])
                curves.append(make.curve(a_points, dir='Z', name=discrete_mix.Label))
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
                        split = make.split(cts,curves[-1], name=cts.Label+suffix)
                        split_curves[aob].append({'source':cts, 'result':split})
                        curves_to_append.append(split)
                        curves_to_remove.append(cts)
                        if cts == mapped_fronts[-1]: mapped_fronts[-1] = split
                        if cts == mapped_front_right: mapped_front_right = split
                    cts.Visibility = False
    for ctr in curves_to_remove:
        if ctr in curves: curves.remove(ctr)
    for cta in curves_to_append:
        curves.append(cta)
    return mapped_front_right