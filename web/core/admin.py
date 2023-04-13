from django.contrib import admin
from . import models

admin.site.register(models.Float_Atom)
admin.site.register(models.Char_Atom)
admin.site.register(models.Part)
admin.site.register(models.Part_Prop)
admin.site.register(models.Float_Prop)
admin.site.register(models.Char_Prop)
admin.site.register(models.Product)