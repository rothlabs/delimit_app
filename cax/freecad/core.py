'''
Provides core functionality for generating product models from drawings.
Paths are imported from the SVG as FreeCAD wires and made into curves. 
Curves are labeled as front, back, top, bottom, left, and right view based on distance from text labels in the SVG.
Curves are also given unique names based on distance of additional labels in the SVG (usually capital letters).
Most objects are created with a bread-crumb naming scheme to make everything explicit in the FreeCAD Tree View.
If an object has 001, 002, etc at the end of the its name, there might be unnecessary dubplicated generation.
The drawing RIGHT view contains BASELINE curves and the TOP, FRONT, & BACK views contain PROFILES curves. 
Baselines and profiles are mixed to generate 3D curves.
Curves go from bottom to top (-Z to +Z) and front to back (-Y to +Y).
'''

# TODO: Make API for selecting curve endpoints

import config
import FreeCAD, Mesh, Part, MeshPart # From FreeCAD
from importSVG import svgHandler # From FreeCAD
from Curves import JoinCurves, approximate_extension, Discretize, mixed_curve, curveExtendFP, splitCurves_2  # From https://github.com/tomate44/CurvesWB
import xml.sax, random, string, math # From Python Built-In

v = FreeCAD.Vector

class Product:
    def __init__(self, name):
        self.doc = FreeCAD.openDocument('templates/'+name+'.FCStd') #.newDocument() 
        self.objects = self.doc.Objects
        self.svg_handler = svgHandler()
        self.svg_handler.doc = self.doc

    def latest_objects(self):
        return [o for o in self.doc.Objects if o not in self.objects]  

    def generate(self,drawing_path):
        # Put SHAPE and STYLE layers into seperate files
        with open(drawing_path,'r') as file: drawing = file.read()
        shape_labels = ['id="shape"','label="shape"',"id='shape'","label='shape'"] 
        style_labels = ['id="style"','label="style"',"id='style'","label='style'"]
        shape_group = drawing[0:drawing.find('<g')]
        style_group = drawing[0:drawing.find('<g')]
        final_gei = 0
        gei = 0
        while True:#i > 3 and i < len(drawing):
            gsi = drawing.find('<g', gei)     # group start index
            gei = drawing.find('</g>', gei)+4 # group end index (3 returned when no group end found)
            if gei > 3: final_gei = gei
            else: break # 
            group = drawing[gsi:gei]
            if any(t in group for t in shape_labels): shape_group += group 
            if any(t in group for t in style_labels): style_group += group 
        shape_drawing = shape_group + drawing[final_gei:]
        style_drawing = style_group + drawing[final_gei:]
        #with open('../tmp/shape_drawing.svg', 'w') as file: file.write(shape_drawing) # Use this to inspect drawing layer

        # The svg_handler inserts svg paths as seperate objects in the FreeCAD document
        xml.sax.parseString(shape_drawing, self.svg_handler) #xml.sax.parse(shape_drawing_path, self.svg_handler)
        self.svg_shapes = self.latest_objects()

        # Identify SVG parts and assign labels
        view_labels = ['Top','Right','Left','Front','Back','Bottom', 'top','right','left','front','back','bottom']
        view_tags  = [(o.LabelText, Part.Vertex(o.Position)) for o in self.svg_shapes if hasattr(o,'LabelText') and any(t in o.LabelText for t in view_labels)]
        shape_tags = [(o.LabelText, Part.Vertex(o.Position)) for o in self.svg_shapes if hasattr(o,'LabelText') and not any(t in o.LabelText for t in view_labels)]
        # Set views:
        def set_view_label(text, tagged_shapes):
            tod = [] # text, object, distance
            for o1 in self.svg_shapes:
                if not o1.Label[-3:]=='___' and hasattr(o1,'Shape') and not hasattr(o1,'LabelText'): # and any(t in o1.Label for t in view_labels):
                    for shape in tagged_shapes:
                        dist = shape.distToShape(o1.Shape)[0]
                        if len(tagged_shapes)<2 or dist < (o1.Shape.BoundBox.XLength + o1.Shape.BoundBox.YLength)/2 *.2: # within 20% of size
                            tod.append({'t':text, 'o':o1, 'd':dist}) 
            if len(tod)>0:
                tod.sort(key = lambda o: o['d'])
                #print(tod[0]['o'].Label)
                tod[0]['o'].Label = str(tod[0]['t'][0]).lower()+'_view__'+random_string(4)+'___'
                #print(tod[0]['o'].Label)
                tagged_shapes.append(tod[0]['o'].Shape)
                set_view_label(text, tagged_shapes)
        for tag in view_tags:
            set_view_label(tag[0],[tag[1]])
        # Set shapes:
        #baselines = []
        view_labels = [v+'_view__' for v in ['front','back','left','right','top','bottom']]
        for st in shape_tags:
            tag_obj_dist = [(st[0], o, st[1].distToShape(o.Shape)[0]) for o in self.svg_shapes if hasattr(o,'Shape')]# and any(t in o.Label for t in view_labels)]
            if len(tag_obj_dist) < 1: raise Exception('No view objects found while attemping to set shape labels.')
            tag_obj_dist.sort(key = lambda o: o[2]) 
            suffix = '_profile'
            if 'right_view__' in tag_obj_dist[0][1].Label: 
                suffix = '_baseline'  
                #baselines.append(tag_obj_dist[0][1])
            tag_obj_dist[0][1].Label = tag_obj_dist[0][1].Label.replace('_view__','_view__'+str(tag_obj_dist[0][0][0])+suffix)[:-7]
            if tag_obj_dist[0][1].Label[-3:] == '001':
                for o1 in self.svg_shapes:
                    if o1.Label == tag_obj_dist[0][1].Label[:-3]:
                        lor = ['left__','right__']
                        if o1.Shape.BoundBox.Center.x > tag_obj_dist[0][1].Shape.BoundBox.Center.x: lor.reverse()
                        o1.Label = o1.Label.replace('_view__','_view__'+lor[0])
                        tag_obj_dist[0][1].Label = tag_obj_dist[0][1].Label.replace('_view__','_view__'+lor[1])[:-3]
        for o1 in self.svg_shapes:
            o1.Visibility = False
            if o1.Label[-3:] == '___':
                if 'right_view__' in o1.Label:
                    for o2 in self.svg_shapes:
                        if o2.Label[-3:] == '___':
                            if 'right_view__' in o2.Label:
                                fob = ['right_view__front_baseline','right_view__back_baseline']
                                if o1.Shape.BoundBox.Center.x > o2.Shape.BoundBox.Center.x: fob.reverse()
                                o1.Label = fob[0]
                                o2.Label = fob[1]
                else:
                    o1.Label = o1.Label[-7:-3] # reduce to the four random characters
        #baselines.sort(key = lambda b: b.Shape.BoundBox.YMax)
        #top_baseline = baselines[-1]

        # Gather information about the imported paths before any transformations
        front_baseline = self.get('right_view__front_baseline')
        back_baseline = self.get('right_view__back_baseline')
        rim_baseline = self.get('right_view__rim_baseline')
        right_view_scale = config.length_y / front_baseline.Shape.BoundBox.XLength
        right_view_translate = -front_baseline.Shape.BoundBox.Center
        f_points = [[],[]] # front and back fuse points
        top_and_right_mixes = []
        curves = [] # Final curves used for surfacing
        top_center_curve = False
        front_edges = []
        front_edge_r_branch = False

        # Transform all RIGHT view objects
        for obj in self.svg_shapes:
            if 'right_view' in obj.Label: 
                transform(obj, translate=right_view_translate, rotate=(v(1,1,1),120), scale=right_view_scale)

        # Build curves from TOP & RIGHT views
        for obj in self.svg_shapes:
            if 'top_view' in obj.Label and 'profile' in obj.Label:# and not 'tt' in obj.Label:
                profile = obj
                baseline, shared_name = self.baseline(profile)

                # Transform TOP view profiles
                transform(profile, rotate = (v(0,0,1),90), scale = baseline.Shape.BoundBox.YLength/profile.Shape.BoundBox.XLength)
                transform(profile, translate = baseline.Shape.BoundBox.Center - profile.Shape.BoundBox.Center)#v(blc.x-pc.x, bvy-profile.Shape.BoundBox.YMax, blc.z-pc.z))#baseline.Shape.BoundBox.Center - profile.Shape.BoundBox.Center)
                if profile.Label == 'top_view__tt_profile': # TODO: Find out why this extra transform is needed. Without it, this profile is not positioned right:
                    transform(profile, translate = v(0, profile.Shape.BoundBox.YMin - baseline.Shape.BoundBox.YMin, 0))
                #if profile.Label == 'top_view__tt_profile' and baseline.Label == 'right_view__tt_baseline': print(profile.Label+str(baseline.Shape.BoundBox.Center - profile.Shape.BoundBox.Center))

                if not 'tt' in profile.Label:
                    # This section preps information for generating mixed curves from TOP & RIGHT views
                    joined_profile = join_curve(source=profile)
                    joined_baseline = join_curve(source=baseline)
                    dpc = config.discretize_point_count
                    profile_points = discretize(joined_profile, dpc*2).Points
                    baseline_points = discretize(joined_baseline, dpc).Points
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
                    if baseline == rim_baseline: 
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
                            if p_points[rsi].y-p_points[rsi+1].y > abs(p_points[rsi].x-p_points[rsi+1].x):break
                        rsi = rsi + 1
                    else:
                        dist_y = 10000
                        for ppi,pp in enumerate(p_points):
                            if ppi>dpc*.5 and ppi<dpc*1.5 and pp.y < dist_y:
                                lsi = ppi
                                rsi = ppi
                                dist_y = pp.y
                    # Mix baseline with top profile:
                    extended_baseline = extend(joined_baseline)
                    test_mix = mix_curve(extended_baseline, joined_profile) # only use mix_curve if 1 edge produced
                    if len(test_mix.Shape.Edges) == 1 and not (config.force_approx_for_rim and baseline == rim_baseline): 
                        # This section creates an exact mixed curve from TOP & RIGHT view (requires at least one function-of-(x or z) source curves)
                        print('EXACT MIX OF TOP+RIGHT: '+shared_name)
                        p_right = make_curve(p_points[:rsi], name=profile.Label+'__right', dir='Y') 
                        left_points = p_points[lsi-1:]
                        left_points.append(p_points[0])
                        p_left = make_curve(left_points, name=profile.Label+'__left', dir='Y') 
                        curves.append(join_curve(source=mix_curve(extended_baseline, p_right, name=shared_name+'__right'), dir='Y')) # curves.append(mix_curve(joined_baseline, p_right, name=shared_name+'__right')) #
                        curves.append(join_curve(source=mix_curve(extended_baseline, p_left, name=shared_name+'__left'), dir='Y')) # curves.append(mix_curve(joined_baseline, p_left, name=shared_name+'__left')) #
                        if lsi-rsi > 0:
                            p_center = make_curve(p_points[rsi-1:lsi], name=profile.Label+'__center', dir='X') 
                            top_center_curve = join_curve(source=mix_curve(extended_baseline, p_center, name=shared_name+'__center'), dir='X', visibility=True)
                    else: 
                        # This section creates an approximate mixed curve from TOP & RIGHT view (allows two non-function-of-(x or z) source curves)
                        print('APPROX MIX OF TOP+RIGHT: '+shared_name)
                        #m_points.insert(dpc,v(m_points[dpc-1].x-dist_between_points/2, m_points[dpc-1].y, m_points[dpc-1].z)) # center point between left and right mixes
                        #m_points.insert(0,v(m_points[0].x-dist_between_points/2, m_points[0].y, m_points[0].z)) # center point between left and right mixes
                        curves.append(make_curve(m_points[:rsi], name=shared_name+'__right', dir='Y', visibility=True))
                        left_points = m_points[lsi-1:]
                        left_points.append(m_points[0])
                        curves.append(make_curve(left_points, name=shared_name+'__left', dir='Y', visibility=True)) #reverse=True
                        if lsi-rsi > 0:
                            top_center_curve = make_curve(m_points[rsi-1:lsi], name=profile.Label+'__center', dir='X') 
                    self.doc.removeObject(test_mix.Name)
                    top_and_right_mixes.append(curves[-1])
                    top_and_right_mixes.append(curves[-2])
                    f_points[1].append(curves[-1].Shape.Vertexes[1].Point) # back fuse point
                    front_right_fuse_p = False
                    if top_center_curve: 
                        curves.append(top_center_curve)
                        f_points[0].append(top_center_curve.Shape.Vertexes[0].Point) # front left fuse point 
                        front_right_fuse_p = top_center_curve.Shape.Vertexes[1].Point  # front right fuse point
                    else:
                        f_points[0].append(curves[-1].Shape.Vertexes[0].Point) # front fuse point 
        
        # Build the front and back edge curves so they hit all the fuse points at the curves that were mixed from TOP & RIGHT
        fb_point_count = 100
        for bi, baseline in enumerate([front_baseline,back_baseline]):
            discrete_baseline = discretize(join_curve(source=baseline, dir='Z'), fb_point_count)
            f_points[bi].sort(key=lambda p:p.z)
            if len(f_points[0]) < 1: raise Exception('No front fuse points. Check top view and related baselines.')
            if len(f_points[1]) < 1: raise Exception('No back fuse points. Check top view and related baselines.')
            points = []
            r_points = [f_points[0][-2]] # right branch to front_right_fuse_p
            fi = 0 # fuse point index
            last_i = fi
            #last_point = discrete_baseline.Points[0]
            for i, p in enumerate(discrete_baseline.Points):
                dist = (v(0,p.y,p.z) - v(0,f_points[bi][fi].y,f_points[bi][fi].z)).Length
                if dist < config.fuse_tolerance_xy or (i==fb_point_count-1 and fi == len(f_points[bi])-1):# or (bi==0 and split_index == 0): # fuse when within 1 mm
                    points.append(f_points[bi][fi])
                    if bi==0 and fi == len(f_points[bi])-1 and front_right_fuse_p: # For front right branch:
                        r_points.append(front_right_fuse_p)
                    if len(points)>1:
                        curves.append(make_curve(points, name=discrete_baseline.Label+'__s'+str(last_i)+'_e'+str(i), visibility=True))
                        if bi==0: 
                            front_edges.append(curves[-1])
                            if fi == len(f_points[bi])-1 and front_right_fuse_p: # For front right branch:
                                curves.append(make_curve(r_points, name=discrete_baseline.Label+'__s'+str(last_i)+'_e'+str(i)+'__r_branch', visibility=True))
                                front_edge_r_branch = curves[-1]
                        last_i = i
                        points.clear()
                        points.append(f_points[bi][fi])
                    fi += 1
                    if fi > len(f_points[bi])-1:
                        break
                    #if fi == len(f_points[bi])-2:
                    #    last_point = points[-1]
                    f_span = (v(0,f_points[bi][fi-1].y,f_points[bi][fi-1].z) - v(0,f_points[bi][fi].y,f_points[bi][fi].z)).Length
                else: 
                    if bi==0 and fi == len(f_points[bi])-1: # last front segment:
                        ratio = (i - last_i) / (len(discrete_baseline.Points)-1 - last_i) # ratio based on index from last fuse to final fuse
                        x = f_points[bi][fi-1].x*(1-ratio) + f_points[bi][fi].x*ratio
                        ratio = math.pow(ratio,2)
                        le = p - discrete_baseline.Points[-1]  # point local to end
                        ap = p*(1-ratio) + (f_points[bi][fi] + le)*ratio
                        points.append(v(x, ap.y, ap.z))
                        if front_right_fuse_p: # for front right branch:
                            x = f_points[bi][fi-1].x*(1-ratio) + front_right_fuse_p.x*ratio
                            ap = p*(1-ratio) + (front_right_fuse_p + le)*ratio
                            r_points.append(v(x, ap.y, ap.z))
                    else: # other segments:
                        ratio = dist / f_span # ratio based on distance from fuse points
                        x = f_points[bi][fi-1].x*ratio + f_points[bi][fi].x*(1-ratio)
                        points.append(v(x, p.y, p.z))

        
        # Build curves from FRONT, BACK, & RIGHT views 
        split_curves = [[],[]] # curves split by 'above' and 'below' cutters
        curves_to_append = []
        curves_to_remove = []
        for obj in self.svg_shapes:
            if ('front_view' in obj.Label or 'back_view' in obj.Label) and 'profile' in obj.Label and '__left__' in obj.Label:
                profiles = [obj, self.get(obj.Label.replace('__left__','__right__'))] 
                baseline, shared_name = self.baseline(obj)

                # Find fuse points
                f_points = [[],[]] # left and right fuse points
                curves_to_split = [[],[]]
                joined_baseline = join_curve(source=baseline)
                extended_baseline = extend(joined_baseline) # extend to make sure it crosses approximated curves from RIGHT view perspective
                surface_baseline = extrude(extended_baseline, dir=v(1,0,0), length=1000, symmetric=True) 
                solid_baseline = extrude(surface_baseline, dir=v(0,1,0), length=1) # For some reason, intersect is not working with surfaces, so extrude surface as solid
                curves_points = [] # curves and points
                ax = 0 # average x
                for curve in curves:
                    intersection = intersect(solid_baseline, curve) 
                    verts = intersection.Shape.Vertexes
                    if len(verts) > 1:
                        curves_points.append({'c':curve, 'p':verts[int(verts[0].Y > verts[1].Y)].Point}) # add point with lowest Y value
                        ax = ax + curves_points[-1]['p'].x
                    self.doc.removeObject(intersection.Name)
                ax = ax / len(curves_points)
                for cp in curves_points:
                    if len(curves_points)<4 and ('front' in cp['c'].Label or 'back' in cp['c'].Label): # add fuse point to left AND right if on front or back edge curve
                        f_points[0].append(cp['p'])
                        f_points[1].append(cp['p'])
                        curves_to_split[0].append(cp['c'])
                    else: 
                        f_points[int(cp['p'].x > ax)].append(cp['p']) 
                        curves_to_split[int(cp['p'].x > ax)].append(cp['c'])
                self.doc.removeObject(solid_baseline.Name)
                self.doc.removeObject(surface_baseline.Name)
                self.doc.removeObject(extended_baseline.Name)

                for pi, profile in enumerate(profiles):
                    if profile == None: raise Exception('No profile for constructing from front view: '+str(profiles))
                    if baseline == None: raise Exception('No baseline for constructing from front view: '+str(profiles))
                    f_points[pi].sort(key=lambda p:p.z)
                    if len(f_points[pi]) < 2: raise Exception('Less than 2 fuse points when building curve from: '+profile.Label+'. Try increasing LengthStart and LengthEnd in "extend" function')
                    if len(f_points[pi]) > 2: raise Exception('More than 2 fuse points when building curve from: '+profile.Label+'. Try decreasing LengthStart and LengthEnd in "extend" function')
                    # Transform front view profiles:
                    transform(profile, rotate = (v(1,0,0),90), scale = (baseline.Shape.BoundBox.ZLength)/profile.Shape.BoundBox.YLength)
                    transform(profile, translate = baseline.Shape.BoundBox.Center - profile.Shape.BoundBox.Center)
                    # Mix curves:
                    joined_profile = join_curve(source=profile, dir='Z')
                    suffix = '__left'
                    if pi>0: suffix = '__right'
                    mix = mix_curve(joined_baseline, joined_profile, profile_dir=v(0,1,0), name=shared_name+suffix)
                    joined_mix = join_curve(source=mix, dir='Z') # joining to force direction to +Z
                    dpc = config.discretize_point_count 
                    discrete_mix = discretize(joined_mix,dpc) 
                    a_points = [f_points[pi][0]] # adjusted points
                    for mi, mp in enumerate(discrete_mix.Points): # TODO: Use map_curve here?
                        lmp = mp - discrete_mix.Points[0] # mixed point local to start
                        rlmp = mp - discrete_mix.Points[-1] # mixed point local to end
                        ratio = mi / dpc 
                        ap = (f_points[pi][0] + lmp)*(1-ratio) + (f_points[pi][1] + rlmp)*ratio
                        a_points.append(ap)
                    a_points.append(f_points[pi][1])
                    curves.append(make_curve(a_points, dir='Z', name=discrete_mix.Label, visibility=True))
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
                            split = split_curve(cts,curves[-1], name=cts.Label+suffix)
                            split_curves[aob].append({'source':cts, 'result':split})
                            curves_to_append.append(split)
                            curves_to_remove.append(cts)
                            if cts == front_edges[-1]: front_edges[-1] = split
                            if cts == front_edge_r_branch: front_edge_r_branch = split
                        cts.Visibility = False
        for ctr in curves_to_remove:
            if ctr in curves: curves.remove(ctr)
        for cta in curves_to_append:
            curves.append(cta)

        # Build faces using clockwise selection of curves starting from bottom curve
        faces = []
        for c in curves: c.Visibility = False
        top_and_right_mixes.sort(key = lambda o: o.Shape.BoundBox.ZMin)
        make_surface([(top_and_right_mixes[0],0), (top_and_right_mixes[1],0)]) # Bottom of sole
        if front_edge_r_branch: # Surfaces between front edge and right branch of front edge:
            for ei in range(len(front_edges[-1].Shape.Edges)):
                if ei == len(front_edges[-1].Shape.Edges)-1:
                    faces.append(make_surface([(front_edges[-1],ei), (front_edge_r_branch,ei), (top_center_curve,0)]))
                else:
                    faces.append(make_surface([(front_edges[-1],ei), (front_edge_r_branch,ei)]))
        for lor in ['__left__','__right__']: 
            for c1 in (c for c in curves if not lor in c.Label and 'above__split' in c.Label): # bottom curve 
                for c1ei, c1e in enumerate(c1.Shape.Edges): # bottom curve edge 
                    for c2 in (c for c in curves if not c==c1 and not lor in c.Label): # left curve (usually)
                        for c2ei, c2e in enumerate(c2.Shape.Edges): # left curve edge (usually)
                            if (c1e.Vertexes[0].Point-c2e.Vertexes[0].Point).Length < config.fuse_tolerance_xy:
                                pc3 = [] # possible top (usually) curve and edge
                                for c3 in (c for c in curves if not c==c2 and not 'above__split' in c.Label and not lor in c.Label): # top curve
                                    for c3ei, c3e in enumerate(c3.Shape.Edges): # top curve edge
                                        if 'e'+str(fb_point_count-1) in c2.Label: # SPECIAL CASE: If the c2 is from the last of front/back curve, the c3e will be pointing down instead of back (use vertex 1 as c3e base instead of vertex 0)
                                            if (c2e.Vertexes[1].Point-c3e.Vertexes[1].Point).Length < config.fuse_tolerance_xy: # use vertex 1 as base for c3e
                                                pc3.append({'c':c3, 'e':c3e, 'i':c3ei})
                                        else:
                                            if (c2e.Vertexes[1].Point-c3e.Vertexes[0].Point).Length < config.fuse_tolerance_xy: # use vertex 0 as base for c3e
                                                pc3.append({'c':c3, 'e':c3e, 'i':c3ei})
                                if len(pc3)>0:
                                    pc3.sort(key=lambda c:c['e'].BoundBox.Center.z) 
                                    c3, c3e, c3ei = pc3[0]['c'], pc3[0]['e'], pc3[0]['i']
                                    if (c3e.Vertexes[0].Point-c1e.Vertexes[1].Point).Length < config.fuse_tolerance_xy: # 3 RIGHT surface?
                                        faces.append(make_surface([(c1,c1ei), (c2,c2ei), (c3,c3ei)]))
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
                                                faces.append(make_surface([(c1,c1ei), (c2,c2ei), (c3,c3ei), (c4,c4ei)]))
                                            else: # This case happens between the front and top baselines (5 side polygon):
                                                for c5 in curves: # Get 5th side:
                                                    for c5ei, c5e in enumerate(c5.Shape.Edges):
                                                        if (c5e.Vertexes[0].Point-c1e.Vertexes[1].Point).Length < config.fuse_tolerance_xy: 
                                                            if (c5e.Vertexes[1].Point-c4e.Vertexes[1].Point).Length < config.fuse_tolerance_xy:
                                                                if config.join_polygon_edges:
                                                                    jc = join_curve(edges=[(c3,c3ei),(c4,c4ei)], dir='Y', name='polygon_join'+lor)
                                                                    faces.append(make_surface([(c1,c1ei), (c2,c2ei), (jc,0),(c5,c5ei)]))
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
                                                                    c6 = make_curve(c6p, dir='Z', name=(lor+'splice')[2:])
                                                                    faces.append(make_surface([(c2,c2ei), (c3,c3ei), (c4,c4ei),(c6,0)]))
                                                                    faces.append(make_surface([(c1,c1ei), (c5,c5ei), (c6,0)]))

        # Build Tongue
        tt_profile = self.get('top_view__tt_profile') # top
        tt_baseline, shared_tt_name = self.baseline(tt_profile)
        tf_baseline = self.get('right_view__tf_baseline') # front
        tb_baseline = self.get('right_view__tb_baseline') # back
        if tt_baseline and tf_baseline and tb_baseline:
            # Make front curve:
            tf_curve = join_curve(tf_baseline, dir='Z', visibility=False)
            # Get tongue back inside edges:
            def get_tongue_inside_edges(base_curve):
                surface = extrude(base_curve, dir=v(1,0,0), length=1000, symmetric=True)
                edges = [[],[]]
                for face in faces:
                    solid = extrude(face, dir = v(-face.Shape.BoundBox.Center.x,0,0), length=config.tongue_margin)
                    intersection = intersect(solid, surface) 
                    if len(intersection.Shape.Edges)>0 and intersection.Shape.BoundBox.XLength < 500: # check for weird bug where intersection results in entire tb_surface
                        pe = [] # potential edges
                        for i,e in enumerate(intersection.Shape.Edges):
                            if e.Length > config.tongue_margin*1.5: pe.append({'e':e,'i':i})
                        pe.sort(key = lambda e: abs(e['e'].BoundBox.Center.x))
                        edges[int(pe[0]['e'].BoundBox.Center.x>0)].append((intersection, pe[0]['i'])) # build list of objects with edge index
                    else:
                        self.doc.removeObject(solid.Name)
                        self.doc.removeObject(intersection.Name)
                return edges
            tb_curve = join_curve(tb_baseline, dir='Z')
            edges = get_tongue_inside_edges(tb_curve)
            # Make tongue back curves:
            tb_curves = []
            discrete_tb_baseline = discretize(tb_curve, config.discretize_point_count) 
            for lri, lr in enumerate(['__left','__right']):
                tb1 = join_curve(edges=edges[lri], dir='Z', approx_tolerance=1, name=tb_baseline.Label+lr+'__in')
                points = []
                for p in discrete_tb_baseline.Points:
                    if p.y > tb1.Shape.Vertexes[1].Y or p.z > tb1.Shape.Vertexes[1].Z: # TODO: if p not on tb1 inside curve
                        points.append(v(tb1.Shape.Vertexes[1].X, p.y, p.z))
                if len(points)>1:
                    tb2 = make_curve(points, dir='Z', name=tb_baseline.Label+lr+'__out')
                    tb_curves.append(join_curve(edges=[(tb1,0),(tb2,0)], dir='Z', approx_tolerance=1, name=tb_baseline.Label+lr+'__comp', visibility=False))
                else: tb_curves.append(tb1)
            # Make tongue top curves
            mixed_tt = join_curve(source=mix_curve(extend(tt_baseline), tt_profile, name=shared_tt_name), dir='X')
            dpc = config.discretize_point_count 
            discrete_mix = discretize(mixed_tt,dpc) 
            tt_left   = map_curve(discrete_mix.Points[:int(dpc/2)], tb_curves[0].Shape.Vertexes[1].Point, tf_curve.Shape.Vertexes[1].Point, mixed_tt.Label+'__left') # left top
            tt_right  = map_curve(discrete_mix.Points[int(dpc/2):], tf_curve.Shape.Vertexes[1].Point, tb_curves[1].Shape.Vertexes[1].Point, mixed_tt.Label+'__right') # right top
            # Get tongue bottom inside edges
            points = [v(0,tb_curves[0].Shape.Vertexes[0].Y,tb_curves[0].Shape.Vertexes[0].Z), tf_curve.Shape.Vertexes[0].Point]
            tbt_curve = make_curve(points, dir='Z', name='tbt_curve')
            edges = get_tongue_inside_edges(tbt_curve)
            # Make tongue bottom curves
            tbt_curves = []
            discrete_tbt_baseline = discretize(tbt_curve, config.discretize_point_count) 
            for lri, lr in enumerate(['__left','__right']):
                tb1 = join_curve(edges=edges[lri], dir='Z', name=tbt_curve.Label+lr+'__in')
                points = [tb1.Shape.Vertexes[1].Point, tf_curve.Shape.Vertexes[0].Point]
                tb2 = make_curve(points, dir='Z', name=tbt_curve.Label+lr+'__out')
                tbt_curves.append(join_curve(edges=[(tb1,0),(tb2,0)], dir='Z', name=tbt_curve.Label+lr+'__comp', visibility=False))
            # Make tongue surfaces
            make_surface([(tb_curves[0],0), (tbt_curves[0],0), (tf_curve,0), (tt_left,0)]) 
            make_surface([(tb_curves[1],0), (tbt_curves[1],0), (tf_curve,0), (tt_right,0)])
        

    # Get the corresponding baseline to the given profile.
    def baseline(self,profile):
        for obj in self.svg_shapes:
            if 'baseline' in obj.Label:
                sn = shared_name(obj) 
                if sn == shared_name(profile):
                    return obj, sn
        raise Exception("No baseline found for: "+profile.Label+'. Add a matching baseline in the drawing (baselines go in right view).')

    # Get a FreeCAD object by path
    def get(self, path):
        list_path = path.split('/')
        def search(objects):
            for obj in objects:
                if obj.Label == list_path[0]:
                    if len(list_path) > 1:
                        list_path.pop(0)
                        return search(obj.OutList)
                    else: 
                        return obj
            raise Exception("No object found for path: "+path)
        return search(self.doc.RootObjects)

    # Export as .obj file
    def export(self,product_id):
        self.doc.recompute() 
        shp = self.shape.Shape.copy()
        shp.rotate(v(0,0,0), v(1,0,0), -90)
        self.mesh.Mesh = MeshPart.meshFromShape(shp, LinearDeflection=0.08, AngularDeflection=0.15, Relative=False)
        self.mesh.recompute()
        Mesh.export([self.mesh],'../tmp/'+str(product_id)+'.obj')




def random_string(n):
    return ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(n))

# Make Surface from list of curves and edges
def make_surface(curves_and_edges):
    s = FreeCAD.ActiveDocument.addObject('Surface::GeomFillSurface','Surface')
    s.BoundaryList = [(ce[0],'Edge'+str(ce[1]+1)) for ce in curves_and_edges]
    s.FillType = 1
    s.recompute()
    #print('Surface:')
    #for i, ce in enumerate(curves_and_edges):
    #    print('C'+str(i)+': '+ce[0].Label+', edge: '+str(ce[1]+1))
    return s

# Make curve from points and map from start to end point
def map_curve(points, start_point, end_point, name, dir='Z'):
    a_points = [start_point] # adjusted points
    for mi, mp in enumerate(points): 
        lps = mp - points[0] # mixed point local to start
        lpe = mp - points[-1] # mixed point local to end
        ratio = mi / (len(points)-1)
        a_points.append( (start_point + lps)*(1-ratio) + (end_point + lpe)*ratio )
    a_points.append(end_point)
    return make_curve(a_points, dir=dir, name=name)

# Split source curve at cutter 
def split_curve(source, cutter, name='untitled'):
    c = FreeCAD.ActiveDocument.addObject("Part::FeaturePython", name+'__split')
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
    b = FreeCAD.activeDocument().addObject("Part::MultiCommon", name+'__intersect')
    b.Visibility = False
    b.Shapes = [source_a,source_b]
    b.recompute() # TODO: Find way to suppress error message when no intersection is found
    return b

# Make extension
def extend(source, visibility=False):
    f = FreeCAD.ActiveDocument.addObject("Part::FeaturePython", source.Label+'__extend')
    curveExtendFP.extend(f)
    f.Edge = (source,'Edge1')
    f.LengthStart = config.baseline_extension # increase this if fuse points for front view are not found, decrease if more than 4 fuse points are found
    f.LengthEnd = config.baseline_extension  # increase this if fuse points for front view are not found, decrease if more than 4 fuse points are found
    curveExtendFP.extendVP(f.ViewObject)
    wireframe_style(f)
    f.Visibility = visibility
    f.recompute()
    return f

# Make extrusion
def extrude(source, dir=v(0,0,0), length=1, symmetric=False):
    f = FreeCAD.ActiveDocument.addObject("Part::Extrusion", source.Label+'__extrude')
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

# Mix front and RIGHT view curves 
def mix_curve(baseline, profile, name='untitled', profile_dir=v(0,0,1)):
    mc = FreeCAD.ActiveDocument.addObject("Part::FeaturePython", name+'__mix')
    mixed_curve.MixedCurveFP(mc, baseline, profile, v(1,0,0), profile_dir)
    mixed_curve.MixedCurveVP(mc.ViewObject)
    #FreeCAD.ActiveDocument.recompute()
    wireframe_style(mc)
    mc.recompute()
    return mc


# Join curves of source into one curve
def join_curve(source=None, edges=None, dir='', visibility=False, approx_tolerance=config.approx_tolerance, name=''):
    if source:
        source.Visibility = False # For GUI
        if name=='': name = source.Label
    curve = FreeCAD.ActiveDocument.addObject("Part::FeaturePython", name+'__join')
    JoinCurves.join(curve)
    approximate_extension.ApproximateExtension(curve)
    JoinCurves.joinVP(curve.ViewObject) # for GUI?
    curve.Active = True # Approximate curve. Needed for smoothness and stability of gordon surface
    curve.ApproxTolerance = approx_tolerance
    if source: curve.Base = source
    else: curve.Edges = [(ce[0],'Edge'+str(ce[1]+1)) for ce in edges]
    wireframe_style(curve)
    curve.Visibility = visibility
    curve.recompute()
    if dir=='X': curve.Reverse = curve.Shape.Vertexes[0].X > curve.Shape.Vertexes[-1].X
    if dir=='Y': curve.Reverse = curve.Shape.Vertexes[0].Y > curve.Shape.Vertexes[-1].Y
    if dir=='Z': curve.Reverse = curve.Shape.Vertexes[0].Z > curve.Shape.Vertexes[-1].Z
    curve.recompute()
    return curve


# Make a new curve from a list of points
def make_curve(points, name='untitled', dir='', visibility=False):
    #name = name + '__poly'
    poly = FreeCAD.ActiveDocument.addObject("Part::Feature", name+'__poly')
    poly.Shape = Part.Wire(Part.makePolygon(points)) ######################3  Use Curves WB Interpolate instead of making poly and join
    poly.Visibility = False
    curve = join_curve(poly, dir=dir, visibility=visibility)
    return curve


# Make discrete object with evenly spaced points along source
def discretize(source,point_count):
    discrete = FreeCAD.ActiveDocument.addObject("Part::FeaturePython",source.Label+'__points')
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
    return (obj.Label
        # Used like directory path:
        .replace('right_view__','')
        .replace('top_view__','')
        .replace('front_view__','')
        .replace('back_view__','')
        .replace('right__','') # found in front and back view 
        .replace('left__','') # found in front and back view
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




                #    ratio = dist / f_span
                #    x = f_points[bi][fi].x*(1-ratio) + f_points[bi][fi-1].x*ratio
                #    points.append(v(x, p.y, p.z))
                #    if bi==0 and fi == len(f_points[bi])-1 and front_right_fuse_p: # For front right branch:
                #        x = front_right_fuse_p.x*(1-ratio) + f_points[bi][fi-1].x*ratio
                #        r_points.append(v(x, p.y, p.z))



                #    m_points.insert(dpc,v(m_points[dpc-1].x-dist_between_points/2, m_points[dpc-1].y, m_points[dpc-1].z)) # center point between left and right mixes
                #    m_points.insert(0,v(m_points[0].x-dist_between_points/2, m_points[0].y, m_points[0].z)) # center point between left and right mixes
                #    curves.append(make_curve(m_points[:dpc+2], name=shared_name+'__right', dir='Y', visibility=True))
                #    left_points = m_points[dpc+1:]
                #    left_points.append(m_points[0])
                #    curves.append(make_curve(left_points, name=shared_name+'__left', dir='Y', visibility=True)) #reverse=True



                #for curve in curves:
                #    intersection = intersect(solid_baseline, curve) 
                #    verts = intersection.Shape.Vertexes
                #    if len(verts) > 1:
                #        if 'front' in curve.Label or 'back' in curve.Label: # add fuse point to left AND right if on front or back edge curve
                #            f_points[0].append(verts[int(verts[0].Y > verts[1].Y)].Point)
                #            f_points[1].append(verts[int(verts[0].Y > verts[1].Y)].Point)
                #            curves_to_split[0].append(curve)
                #        else: # Add lowest Y-value point to left OR right list:
                #            f_points[int(verts[0].X > 0)].append(verts[int(verts[0].Y > verts[1].Y)].Point) 
                #            curves_to_split[int(verts[0].X > 0)].append(curve)



                    #for i in range(dpc):
                    #    lsi = fci+i # left split index
                    #    rsi = fci-i # right split index
                    #    ay = (p_points[lsi].y+p_points[rsi].y)/2 # average y
                    #    if abs(p_points[fci].y-ay)*1.5 > abs(p_points[lsi].x-p_points[rsi].x): 
                    #        print(i)
                    #        break


                #    f_points[0].append(m_points[dpc-1]) # save front fuse point
                #    f_points[1].append(m_points[0]) # save back fuse point

                #    fob = curves[-1].Shape.Vertexes[0].Y > curves[-1].Shape.Vertexes[1].Y
                #    f_points[int(fob )].append(curves[-1].Shape.Vertexes[0].Point) # save fuse point
                #    f_points[int(not fob)].append(curves[-1].Shape.Vertexes[1].Point) # save fuse point



#for nn in range(dpc): # Crawl along profile to find first point that matches up with baseline point on Y axis
                            #    lps = profile_points[pi] - profile_start
                            #    lpe = profile_points[pi] - profile_end
                            #    py = (baseline_start.y + lps.y)*(1-ratio) + (baseline_end.y + lpe.y)*(ratio)
                            #    #if abs(by-py) < dist_between_points:
                            #    #    break
                            #    if abs(by-py) > last_y_diff:
                            #        pi = pi - 1
                            #        if pi < 0: pi = len(profile_points)-1 # loop profile index
                            #        lps = profile_points[pi] - profile_start
                            #        lpe = profile_points[pi] - profile_end
                            #        py = (baseline_start.y + lps.y)*(1-ratio) + (baseline_end.y + lpe.y)*(ratio)
                            #        break
                            #    last_y_diff = abs(by-py)
                            #    pi = pi + 1
                            #    if pi > len(profile_points)-1: pi = 0 # loop profile index





# This loop goes up and down the baseline to gather point data from baseline and profile
                #for d in range(2): 
                #    for n in baseline_points:
                #        if bi == 0 or bi == dpc-1: # fuse point:
                #            m_points.append(  v(profile_points[pi].x, baseline_points[bi].y, baseline_points[bi].z)  ) 
                #        else: # regular point:
                #            lbs = baseline_points[bi] - baseline_start
                #            lbe = baseline_points[bi] - baseline_end
                #            lps = profile_points[pi] - profile_start
                #            lpe = profile_points[pi] - profile_end
                #            ratio = bi / (dpc-1) # Smoothly shift point reference from start and end of baseline
                #            px = (baseline_start.x + lps.x)*(1-ratio)           + (baseline_end.x + lpe.x)*(ratio)
                #            my = (baseline_start.y + (lbs.y+lps.y)/2)*(1-ratio) + (baseline_end.y + (lbe.y+lpe.y)/2)*(ratio)
                #            #scale_z = abs(px) / joined_profile.Shape.BoundBox.XLength * 2.1 # smooth along x axis
                #            #if scale_z>1: scale_z=1
                #            scale_z=1
                #            bz = (baseline_start.z + lbs.z*scale_z)*(1-ratio)   + (baseline_end.z + lbe.z*scale_z)*(ratio)
                #            m_points.append(  v(px, my, bz)  ) 
                #            #m_points.append(  v(profile_points[pi].x, (baseline_points[bi].y+profile_points[pi].y)/2, baseline_points[bi].z)  ) 
                #        p_points.append(profile_points[pi])
                #        #if bi < len(baseline.Points): b_points.append(baseline[bi])
                #        bi = bi + baseline_dir
                #        pi = pi + 1
                #        if pi >= len(profile_points): pi = 0 # loop profile index
                #    bi = max(0,min(bi,dpc-1)) # clamp baseline index
                #    baseline_dir = -baseline_dir




#        for o1 in self.svg_shapes:
#            o1.Visibility = False
#            if hasattr(o1,'Shape'):
#                view_tag = [((vt[0], vt[1].distToShape(o1.Shape)[0])) for vt in view_tags]
#                view_tag.sort(key = lambda o: o[1])
#                o1.Label = str(view_tag[0][0][0]).lower()+'_view__'+random_string(4)+'___'


#shape_drawing_path = '../tmp/shape_drawing.svg'
        ##with open(shape_drawing_path, 'w') as file: file.write(shape_drawing)

        #view_labels = []
        #shape_labels = []
        #for obj in self.svg_shapes:
        #    if hasattr(obj,'LabelText'):
        #        if any(t in obj.LabelText for t in ['Top','Right','Left','Front','Back']):
        #            view_labels.append((obj.LabelText, Part.Vertex(obj.Position)))
        #        else:
        #            shape_labels.append((obj.LabelText, Part.Vertex(obj.Position)))


#vl.Position-obj.Shape.BoundBox.Center).Length

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
