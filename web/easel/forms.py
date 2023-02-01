from django.forms import ModelForm, NumberInput
from catalog.models import Shoe

class RangeInput(NumberInput):
    input_type = "range"

class Edit_Form(ModelForm):
    class Meta:
        model = Shoe
        fields = ['name',
                'view_x','view_y','view_z',
                'line_art',
                'painting',
                'heel_height',
                ]
        widgets = {
            'heel_height': RangeInput(attrs={"min":.5, "max":2}),
            'view_x': NumberInput(attrs={"type":"hidden"}),
            'view_y': NumberInput(attrs={"type":"hidden"}),
            'view_z': NumberInput(attrs={"type":"hidden"}),
        }