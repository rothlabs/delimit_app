import config
import FreeCAD
from . import make, get, mod

v = FreeCAD.Vector

def build(shoe, sole_upper_divide, upper_bound):
    divide_surf = make.surface([(sole_upper_divide,0), (upper_bound,0)])
    upper_block = make.extrude(divide_surf, dir=v(1,0,0), dist=300, symmetric=True)
    return make.common([shoe, upper_block], name='upper', vis=True)