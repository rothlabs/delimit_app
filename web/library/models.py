from django.db import models

# Create your models here.

# Product blueprint
class Blueprint(models.Model):
    name = models.CharField(max_length=64)
    publish_date = models.DateTimeField()
