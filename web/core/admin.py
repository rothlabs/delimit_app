from django.contrib import admin
from . import models

admin.site.register(models.Product)
admin.site.register(models.Part)
admin.site.register(models.Float)
admin.site.register(models.String)