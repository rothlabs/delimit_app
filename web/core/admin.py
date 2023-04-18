from django.contrib import admin
from . import models

#admin.site.register(models.Project)
admin.site.register(models.Bool)
admin.site.register(models.Int)
admin.site.register(models.Float)
admin.site.register(models.String)
admin.site.register(models.Part)
admin.site.register(models.Account)