from django.forms import ModelForm, NumberInput
from catalog.models import Product

class RangeInput(NumberInput):
    input_type = "range"

class Edit_Form(ModelForm):
    class Meta:
        model = Product
        fields = ['name','top_sketch','side_sketch','heel_height','view_x','view_y','view_z']
        widgets = {
            'heel_height': RangeInput(attrs={}),
            'view_x': NumberInput(attrs={"type":"hidden"}),
            'view_y': NumberInput(attrs={"type":"hidden"}),
            'view_z': NumberInput(attrs={"type":"hidden"}),
        }