from django.forms import ModelForm, TextInput
from catalog.models import Product

class Edit_Form(ModelForm):
    class Meta:
        model = Product
        fields = ['name']
        #widgets = {
        #    'name': TextInput(attrs={
        #        'class': "form-control",
        #        }),
        #}