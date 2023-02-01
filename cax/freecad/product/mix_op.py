import config
import FreeCAD
from . import make, get, mod

v = FreeCAD.Vector

def build(raws, baselines):
    doc = FreeCAD.ActiveDocument
    curves = []
    mixes = []
    fuses = [[],[]] # front and back fuse points
    rim_front = False
    insole = []
    # Build curves from TOP & RIGHT views
    for obj in raws:
        if 'top_view' in obj.Label and 'profile' in obj.Label:# and not 'tt' in obj.Label:
            profile = obj
            baseline, shared_name = get.baseline(raws, profile)

            # Transform TOP view profiles
            mod.transform(profile, rotate = (v(0,0,1),90), scale = baseline.Shape.BoundBox.YLength/profile.Shape.BoundBox.XLength)
            mod.transform(profile, translate = baseline.Shape.BoundBox.Center - profile.Shape.BoundBox.Center)#v(blc.x-pc.x, bvy-profile.Shape.BoundBox.YMax, blc.z-pc.z))#baseline.Shape.BoundBox.Center - profile.Shape.BoundBox.Center)
            if profile.Label == 'top_view__tt_profile': # TODO: Find out why this extra transform is needed. Without it, this profile is not positioned right:
                mod.transform(profile, translate = v(0, profile.Shape.BoundBox.YMin - baseline.Shape.BoundBox.YMin, 0))
            #if profile.Label == 'top_view__tt_profile' and baseline.Label == 'right_view__tt_baseline': print(profile.Label+str(baseline.Shape.BoundBox.Center - profile.Shape.BoundBox.Center))

            if not 'tt' in profile.Label:
                # This section preps information for generating mixed curves from TOP & RIGHT views
                joined_profile = make.join(profile)
                joined_baseline = make.join(baseline)
                dpc = config.discrete_count
                profile_points = make.discrete(joined_profile, count=dpc*2).Points
                baseline_points = make.discrete(joined_baseline, count=dpc).Points
                bi = 0 # baseline index
                baseline_start = baseline_points[0]
                baseline_end = baseline_points[-1]
                baseline_dir = 1
                if baseline_points[0].y < baseline_points[-1].y: # Make sure that the baseline index starts at the back seam of the product:
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
                pei = pi - dpc # profile end index
                if pei < 0: pei = pi + dpc
                profile_end = profile_points[pei] # Could result in out of bounds error? ----------------------------------------- !!!
                dist_between_points = profile.Shape.Length / (dpc*2)
                m_points = [] # mixed points
                p_points = [] # profile points

                # This loop goes up and down the baseline to gather point data from baseline and profile
                for d in range(2): 
                    for n in baseline_points:
                        if bi == 0 or bi == dpc-1: # fuse point:
                            m_points.append(  v(profile_points[pi].x, baseline_points[bi].y, baseline_points[bi].z)  ) 
                        else: # regular point:
                            ratio = bi / (dpc-1) # Smoothly shift point reference from start and end of baseline
                            lbs = baseline_points[bi] - baseline_start 
                            lbe = baseline_points[bi] - baseline_end
                            lps = profile_points[pi] - profile_start 
                            lpe = profile_points[pi] - profile_end   
                            px = (baseline_start.x + lps.x)*(1-ratio) + (baseline_end.x + lpe.x)*(ratio) 
                            by = baseline_points[bi].y#(baseline_start.y + lbs.y)*(1-ratio) + (baseline_end.y + lbe.y)*(ratio)
                            py = (baseline_start.y + lps.y)*(1-ratio) + (baseline_end.y + lpe.y)*(ratio)
                            my = (by+py)/2 # Mix Y from baseline and profile
                            scale_z = abs(px) / joined_profile.Shape.BoundBox.XLength * 2 # smooth z along x axis
                            if scale_z>1 or not config.smooth_z_for_approx_mix: scale_z=1
                            bz = (baseline_start.z + lbs.z*scale_z)*(1-ratio)   + (baseline_end.z + lbe.z*scale_z)*(ratio)
                            m_points.append(  v(px, my, bz)  ) 
                        p_points.append(profile_points[pi])
                        bi = bi + baseline_dir
                        pi = pi + 1
                        if pi >= len(profile_points): pi = 0 # loop profile index
                    bi = max(0,min(bi,dpc-1)) # clamp baseline index
                    baseline_dir = -baseline_dir

                # Get split indecies for top view profile:
                dist_y = 10000
                if baseline == baselines['rim']: 
                    dist_x = 10000
                    for ppi,pp in enumerate(p_points):
                        if ppi>dpc*.5 and ppi<dpc*1.5 and abs(pp.x) < dist_x:
                            fci = ppi # front center index
                            dist_x = abs(pp.x)
                    for i in range(dpc):
                        lsi = fci+i # left split index
                        if p_points[lsi].y-p_points[fci].y > abs(p_points[lsi].x): break
                        if p_points[lsi].y-p_points[lsi-1].y > abs(p_points[lsi].x-p_points[lsi-1].x): break
                    #lsi = lsi - 1
                    for i in range(dpc):
                        rsi = fci-i # right split index
                        if p_points[rsi].y-p_points[fci].y > abs(p_points[rsi].x): break
                        if p_points[rsi].y-p_points[rsi+1].y > abs(p_points[rsi].x-p_points[rsi+1].x): break
                    rsi = rsi + 1
                    for ppi,pp in enumerate(p_points):
                        if ppi>dpc*.5 and ppi<dpc*1.5 and pp.y < dist_y:
                            center_split_i = ppi
                            dist_y = pp.y
                else:
                    for ppi,pp in enumerate(p_points):
                        if ppi>dpc*.5 and ppi<dpc*1.5 and pp.y < dist_y:
                            lsi = ppi
                            rsi = ppi
                            dist_y = pp.y
                # Mix baseline with top profile:
                extended_baseline = make.extend(joined_baseline)
                test_mix = make.mix(extended_baseline, joined_profile) # only use mix_curve if 1 edge produced
                if len(test_mix.Shape.Edges) == 1 and not (config.force_approx_for_rim and baseline == baselines['rim']): 
                    # This section creates an exact mixed curve from TOP & RIGHT view (requires at least one function-of-(x or z) source curves)
                    print('EXACT MIX OF TOP+RIGHT: '+shared_name)
                    left_points = p_points[lsi-1:]
                    left_points.append(p_points[0])
                    p_left = make.curve(left_points, name=profile.Label+'__left', dir='Y') 
                    p_right = make.curve(p_points[:rsi], name=profile.Label+'__right', dir='Y') 
                    curves.append(make.join(make.mix(extended_baseline, p_left, name=shared_name+'__left'), dir='Y')) # curves.append(make.mix(joined_baseline, p_left, name=shared_name+'__left')) #
                    curves.append(make.join(make.mix(extended_baseline, p_right, name=shared_name+'__right'), dir='Y')) # curves.append(make.mix(joined_baseline, p_right, name=shared_name+'__right')) #
                    if lsi-rsi > 0:
                        p_center = make.curve(p_points[rsi-1:lsi], name=profile.Label+'__center', dir='X') 
                        rim_front = make.join(make.mix(extended_baseline, p_center, name=shared_name+'__center'), dir='X')
                else: 
                    # This section creates an approximate mixed curve from TOP & RIGHT view (allows two non-function-of-(x or z) source curves)
                    print('APPROX MIX OF TOP+RIGHT: '+shared_name)
                    left_points = m_points[lsi-1:]
                    left_points.append(m_points[0])
                    curves.append(make.curve(left_points, name=shared_name+'__left', dir='Y')) #reverse=True
                    curves.append(make.curve(m_points[:rsi], name=shared_name+'__right', dir='Y'))
                    if lsi-rsi > 0:
                        rim_front = make.curve(m_points[rsi-1:lsi], name=profile.Label+'__center', dir='X')
                doc.removeObject(test_mix.Name)
                mixes.append(curves[-2])
                mixes.append(curves[-1])
                if 'insole' in profile.Label:
                    insole.append(curves[-2])
                    insole.append(curves[-1])
                else:
                    fuses[1].append(curves[-1].Shape.Vertexes[1].Point) # back fuse point
                    fuse_rim_front_right = False
                    if rim_front: 
                        curves.append(rim_front)
                        fuses[0].append(rim_front.Shape.Vertexes[0].Point) # front left fuse point 
                        fuse_rim_front_right = rim_front.Shape.Vertexes[1].Point  # front right fuse point
                    else:
                        fuses[0].append(curves[-1].Shape.Vertexes[0].Point) # front fuse point 
    mixes.sort(key = lambda o: o.Shape.BoundBox.ZMin)
    mixes = {
        'lowest':    [mixes[0], mixes[1]],
        'rim_front': rim_front,
        'insole':    insole,
    }
    return curves, mixes, fuses, fuse_rim_front_right