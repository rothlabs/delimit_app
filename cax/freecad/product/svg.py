import xml.sax
import FreeCAD
from importSVG import svgHandler # From FreeCAD

# Put SHAPE and STYLE layers into seperate files and import shapes
def load(drawing):
    with open(drawing,'r') as file: drawing = file.read()
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
    # The svg_handler inserts svg paths as seperate objects in the FreeCAD document
    svg_handler = svgHandler()
    svg_handler.doc = FreeCAD.ActiveDocument
    xml.sax.parseString(shape_drawing, svg_handler) #xml.sax.parse(shape_drawing_path, svg_handler)
    return FreeCAD.ActiveDocument.Objects