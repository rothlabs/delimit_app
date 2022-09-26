from django.forms import ModelForm, NumberInput
from catalog.models import Product

class RangeInput(NumberInput):
    input_type = "range"

class Edit_Form(ModelForm):
    class Meta:
        model = Product
        fields = ['name','top_sketch','side_sketch','heel_height']
        widgets = {
            'heel_height': RangeInput(attrs={}),
        }