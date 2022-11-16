test_drawing = '/home/julian/delimit/cax/sketches/runner_4.svg'
#test_insole  = '/home/julian/delimit/cax/sketches/insole_1.svg'

# default shoe length (scale drawing so bottom most baseline matches this length)
length_y = 250 #mm

# Wall thickness of toe and heel of shoe. Used to scale insole to correct size
toe_heel_y_thickness = 8 #mm

# Sole rim thickness 
sole_rim_thickness = 1 #mm

# Sole overlap 
sole_overlap = 5 #mm

# heel overlap
heel_overlap = 5 #mm



# If testing with FreeCAD GUI, this is needed to prevent nested recomputes? (stop crashing)
#recompute_sleep = .01


# Number of divisions when discretizing a curve:
discretize_point_count = 100


# Used for smoothing joined curves. Larger numbers are smoother.
approx_tolerance = .1


# Max XY-plane fuse distance for building surfaces:
fuse_tolerance_xy = 1 #mm


# How far to extend baslines (important to ensure they are long enough for calculations with other geometry)
baseline_extension = 2 #mm    # increase this if fuse points for front view are not found, decrease if more than 2 fuse points are found


# distance from shoe surface to tongue back curve
tongue_margin = 1 #mm


# True:  Reduce polygon to 4 or less edges by joining at least two edges
# False: Reduce polygon to 4 or less edges by splicing
join_polygon_edges = True


# True:  Create striaght lines to splice polygon made of 5 sides or more.
# False: Interpolate a curved splice based on adjacent curves.
straight_polygon_splice = True 


# True: When approx mixing top and right curves together, smoothly adjust so Z values are scaled down close to the XY plane (Smooth arc effect from front view).
# False: Do not adjust Z values.
smooth_z_for_approx_mix = True


# True: Force approx mixing of top and right views for top most basline 
# False: Do not force approx mixing
force_approx_for_rim = False