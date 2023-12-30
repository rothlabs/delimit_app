from django.contrib import admin
from . import models

admin.site.register(models.Repo)
#admin.site.register(models.Snap)
admin.site.register(models.Commit)

# admin.site.register(models.Bool)
# admin.site.register(models.Int)
# admin.site.register(models.Float)
# admin.site.register(models.String)
# admin.site.register(models.Tag)
# admin.site.register(models.Part)
# admin.site.register(models.Part_Part)
# admin.site.register(models.Part_Bool)
# admin.site.register(models.Part_Int)
# admin.site.register(models.Part_Float)
# admin.site.register(models.Part_String)
# admin.site.register(models.Part_User)