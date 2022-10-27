# Number of divisions when discretizing a curve:
discretize_point_count = 100


# Max XY-plane fuse distance for building surfaces:
fuse_tolerance_xy = 1 #mm


# How far to extend baslines (important to ensure they are long enough for calculations with other geometry)
baseline_extension = 4 #mm 


# True:  Reduce polygon to 4 or less edges by joining at least two edges
# False: Reduce polygon to 4 or less edges by splicing
join_polygon_edges = False

# True:  Create striaght lines to splice polygon made of 5 sides or more.
# False: Interpolate a curved splice based on adjacent curves.
straight_polygon_splice = True 


# True: When approx mixing top and right curves together, smoothly adjust so Z values are scaled down close to the XY plane (Smooth arc effect from front view).
# False: Do not adjust Z values.
smooth_z_for_approx_mix = True


# True: Force approx mixing of top and right views for top most basline 
# False: Do not force approx mixing
force_approx_for_top_baseline = False