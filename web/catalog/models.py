import os
from django.db import models
from django.dispatch import receiver
import django.utils

class Sketch(models.Model):
    name = models.CharField(max_length=64)
    publish_date = models.DateTimeField(default=django.utils.timezone.now)
    svg = models.TextField()

class Product(models.Model):
    name = models.CharField(max_length=64)
    publish_date = models.DateTimeField()
    glb = models.FileField(upload_to='glb', default='glb/default.glb')
    view_x = models.FloatField(default=150)
    view_y = models.FloatField(default=150)
    view_z = models.FloatField(default=150)

    # Shoe related fields that should be moved out to a different 'Shoe' model and referenced by this model with ForeignKey?
    top_sketch = models.ForeignKey(Sketch, related_name='top_sketch', default='', on_delete=models.CASCADE)
    side_sketch = models.ForeignKey(Sketch, related_name='side_sketch', default='', on_delete=models.CASCADE)
    heel_height = models.FloatField(default=0)


# The below functions are for deleting unused media files. They might not be safe. 
# https://stackoverflow.com/questions/16041232/django-delete-filefield
@receiver(models.signals.post_delete, sender=Product)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """
    Deletes file from filesystem
    when corresponding `Product` object is deleted.
    """
    if instance.glb:
        if os.path.isfile(instance.glb.path):
            os.remove(instance.glb.path)

@receiver(models.signals.pre_save, sender=Product)
def auto_delete_file_on_change(sender, instance, **kwargs):
    """
    Deletes old file from filesystem
    when corresponding `Product` object is updated
    with new file.
    """
    if not instance.pk:
        return False

    try:
        old_file = Product.objects.get(pk=instance.pk).glb
    except Product.DoesNotExist:
        return False

    new_file = instance.glb
    if not old_file == new_file:
        if os.path.isfile(old_file.path):
            os.remove(old_file.path)