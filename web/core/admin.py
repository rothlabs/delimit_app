from django.contrib import admin
from . import models

admin.site.register(models.Snap)
admin.site.register(models.Repo)
admin.site.register(models.Node)
admin.site.register(models.Version)
admin.site.register(models.Code_Access)