import os
from django.db import models
from django.dispatch import receiver
import django.utils

# Probably want polymorphic: https://django-polymorphic.readthedocs.io/en/stable/

class Base_Model(models.Model):
    class Meta:
        abstract = True
    name = models.CharField(max_length=64)
    date = models.DateTimeField(default=django.utils.timezone.now)
    def __str__(self): 
        return self.name+' ('+str(self.id)+')'
    def data(self): # used to generate template json script tags with data for javascript 
        d = dict(self.__dict__)
        del d['_state'] # removed because value of '_state' cannot be serialized
        del d['file'] # not needed because url is incomplete with this approach
        return d 

class Drawing(Base_Model):
    file = models.FileField(upload_to='drawing', default='drawing/default.svg')

class Drawn(models.Model):
    class Meta:
        abstract = True
    line_art = models.ForeignKey(Drawing, related_name='line_art', default='', on_delete=models.CASCADE) #verbose_name='sketch'
    painting = models.ForeignKey(Drawing, related_name='painting', default='', on_delete=models.CASCADE)

class Product(Base_Model):
    file = models.FileField(upload_to='product', default='product/default.glb')
    view_x = models.FloatField(default=100)
    view_y = models.FloatField(default=100)
    view_z = models.FloatField(default=100)
    
class Shoe(Drawn, Product):
    heel_height = models.FloatField(default=.5)


# The below functions are for deleting unused media files. They might not be safe. 
# https://stackoverflow.com/questions/16041232/django-delete-filefield
@receiver(models.signals.post_delete, sender=Drawing)
@receiver(models.signals.post_delete, sender=Product)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """
    Deletes file from filesystem
    when corresponding `Product` object is deleted.
    """
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)

@receiver(models.signals.pre_save, sender=Drawing)
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
        old_file = Product.objects.get(pk=instance.pk).file
    except Product.DoesNotExist:
        return False
    new_file = instance.file
    if not old_file == new_file:
        if os.path.isfile(old_file.path):
            os.remove(old_file.path)