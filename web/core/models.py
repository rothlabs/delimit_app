import os
from django.db import models
from django.dispatch import receiver
import django.utils
from django.utils.crypto import get_random_string
from django.contrib.auth.models import User

def random_id():
    return get_random_string(length=8)

class Product(models.Model):
    id = models.CharField(primary_key=True, max_length=8, default=random_id)
    name = models.CharField(max_length=64)
    date = models.DateTimeField(default=django.utils.timezone.now)
    file = models.FileField(upload_to='product', default='product/default.glb')
    owner = models.ForeignKey(User, default=0, on_delete=models.CASCADE)
    public = models.BooleanField(default=False)
    description = models.TextField(default='', blank=True)
    def __str__(self): 
        return self.name+' ('+os.path.basename(self.file.name)+')'


# https://stackoverflow.com/questions/16041232/django-delete-filefield
@receiver(models.signals.post_delete, sender=Product)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """
    Deletes file from filesystem
    when corresponding `Product` object is deleted.
    """
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)

# @receiver(models.signals.pre_save, sender=Product)
# def auto_delete_file_on_change(sender, instance, **kwargs):
#     """
#     Deletes old file from filesystem
#     when corresponding `Product` object is updated
#     with new file.
#     """
#     if not instance.pk:
#         return False
#     try:
#         old_file = Product.objects.get(pk=instance.pk).file
#     except Product.DoesNotExist:
#         return False
#     new_file = instance.file
#     if not old_file == new_file:
#         if os.path.isfile(old_file.path):
#             os.remove(old_file.path)




# Probably want polymorphic: https://django-polymorphic.readthedocs.io/en/stable/

#    camera_x = models.FloatField(default=0)
#    camera_y = models.FloatField(default=0)
#    camera_z = models.FloatField(default=10)
    
#class Shoe(Product):
#    heel_height = models.FloatField(default=.5)


#class Base_Model(models.Model):
#    class Meta:
#        abstract = True
#    id = models.CharField(primary_key=True, max_length=8, default=get_random_string(length=8))
#    name = models.CharField(max_length=64)
#    date = models.DateTimeField(default=django.utils.timezone.now)
#    def __str__(self): 
#        return self.name+' ('+str(self.id)+')'
    #def data(self): # used to generate template json script tags with data for javascript 
    #   d = dict(self.__dict__)
    #if hasattr(self,'file'):
    #   d['url'] = self.file.url
    #   del d['file']   # removed in favor of d['url'] = self.file.url which has complete url
    #del d['_state'] # removed because value of '_state' cannot be serialized
    #return d 