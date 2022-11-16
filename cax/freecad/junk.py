#print([o.Label for o in latest])

#with open('/home/julian/delimit/cax/freecad/input/top_sketch.svg', 'w+') as svg_file:
    #    svg_file.write(data['sketch_xy'])
    #    svg_file.close()
    #importSVG.insert('/home/julian/delimit/cax/freecad/input/top_sketch.svg',shoe.doc.Name)

#writer.close() # Is it needed?


#product.doc.recompute()



#upper_rim_surf = make_surface([(rim_curves[0],0),(rim_curves[1],0)], name='rim_cap')
        # faces.append(upper_rim_surf)

# Get lowest surface on upper_block
        #upper_block_surfs = upper_block.Shape.Faces
        #upper_block_surfs.sort(key=lambda o: o.BoundBox.YMin)
        #lowest_surf = upper_block_surfs[0]
        # Get upper base edges
        #edges = [[],[]]
        #for ei, e in enumerate(upper_intersect.Shape.Edges):
        #    if len(e.Vertexes) == 2:
        #        if e.Vertexes[0].distToShape(lowest_surf)[0] < .001 and e.Vertexes[1].distToShape(lowest_surf)[0] < .001:
        #            edges[int(e.BoundBox.Center.x>0)].append((upper_intersect,ei))
        # Make surfaces
        #upper_base_curves = [] 
        #for lri, lr in enumerate(['left','right']):
        #    edges[lri].sort(key=lambda o: o[0].Shape.Edges[o[1]].BoundBox.Center.y)
        #    upper_base_curves.append(join_curve(edges=edges[lri], dir='Y', name='upper_base__'+lr, visibility=False))
        #upper_base_surf = make_surface([(upper_base_curves[0],0), (upper_base_curves[1],0)])
        #upper = compound([upper_intersect, upper_base_surf], name='upper')

        # Make rim and base cutter blocks
        #upper_rim_cutter_1 = extrude(upper_rim_surf, dir=v(0,0,1), length=10)
       #upper_rim_cutter_2 = extrude(upper_rim_surf, dir=v(0,-1,1), length=1, symmetric=True)
        #upper_rim_cutter = compound([upper_rim_cutter_1, upper_rim_cutter_2], name='upper_rim_cutter')
        #upper_base_cutter_1 = extrude(upper_base_surf, dir=v(0,-.5,-1), length=10)
        #upper_base_cutter_2 = extrude(upper_base_surf, dir=v(0,-1,1), length=1, symmetric=True)
        #upper_base_cutter = compound([upper_base_cutter_1, upper_base_cutter_2], name='upper_base_cutter')

        ## Cut heel
        #heel_box_1 = Part.show(Part.makeBox(config.heel_overlap, 200, 400, v(-config.heel_overlap*1.5,0,-200))) # Part.show() puts it into the Tree View
        #upper_1 = cut(upper_raw, heel_box_1, name='upper_1')
        #heel_box_2 = Part.show(Part.makeBox(config.heel_overlap*2, 200, 400, v(-config.heel_overlap*1.5,0,-200)))
        #upper_2 = intersect(upper_raw, heel_box_2, name='upper_2', visibility=True)

        #upper = compound([upper_1, upper_2], name='upper')
        # upper_right
        #uppers = []
        #uppers = intersection(shoe_compound, upper_block)




#for f in upper_intersect.Shape.Faces:
        #    if f.BoundBox.YMin < lowest_surf.BoundBox.YMin:
        #        lowest_surf = f



#m_points.insert(dpc,v(m_points[dpc-1].x-dist_between_points/2, m_points[dpc-1].y, m_points[dpc-1].z)) # center point between left and right mixes
                        #m_points.insert(0,v(m_points[0].x-dist_between_points/2, m_points[0].y, m_points[0].z)) # center point between left and right mixes




# Build sole:
        #xml.sax.parse(insole_drawing_path, self.svg_handler)
        #insole_profile = self.doc.Objects[-1] # should only be top view profile in drawing
        #insole_profile.Label = 'top_view__insole_profile'
        #insole_baseline = self.get('right_view__insole_baseline')
        ##sole_baseline = self.get('right_view__sole_baseline')
        # Make insole curve:
        #transform(insole_baseline, translate=v(0,config.toe_heel_y_thickness,0), scale=(insole_baseline.Shape.BoundBox.YLength-config.toe_heel_y_thickness*2) / insole_baseline.Shape.BoundBox.YLength)
        #transform(insole_profile, rotate = (v(0,0,1),90), scale = insole_baseline.Shape.BoundBox.YLength/insole_profile.Shape.BoundBox.XLength)
        #transform(insole_profile, translate = insole_baseline.Shape.BoundBox.Center - insole_profile.Shape.BoundBox.Center)
        #insole_baseline = join_curve(source=insole_baseline, dir='Y', visibility=False)
        #insole_mix = join_curve(source=mix_curve(extend(insole_baseline), insole_profile, name = 'insole_mix'), dir='Y')
        #p = insole_mix.Shape.valueAt(0.5)
        #cp = Part.Vertex(p)
        #print('cut point: '+str(cp))



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