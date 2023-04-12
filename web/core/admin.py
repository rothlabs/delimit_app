from django.contrib import admin
from . import models

admin.site.register(models.Product)
admin.site.register(models.Group)
admin.site.register(models.Vector)
admin.site.register(models.Line)
admin.site.register(models.Sketch)
admin.site.register(models.Surface)