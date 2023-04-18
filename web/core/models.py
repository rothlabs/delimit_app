import os
from django.db import models
from django.dispatch import receiver
import django.utils
from django.utils.crypto import get_random_string
from django.contrib.auth.models import User
from django.db.models.signals import post_save

def random_id(): return get_random_string(length=16)

class Id(models.Model):
    class Meta: abstract = True
    id = models.CharField(default=random_id, max_length=16, primary_key=True)
class Atom(models.Model):
    class Meta: abstract = True
    def __str__(self): return str(self.v)+' ('+str(self.id)+')'

class Bool(Id, Atom):   v = models.BooleanField(default=False)
class Int(Id, Atom):    v = models.IntegerField(default=0)
class Float(Id, Atom):  v = models.FloatField(default=0)
class String(Id, Atom): v = models.TextField(default='', blank=True)

class Part(Id): # p for part, u for user (a part that is using this part)
    c = models.ManyToManyField('self', related_name='p', blank=True, symmetrical=False)
    b = models.ManyToManyField(Bool,   related_name='p', blank=True)
    i = models.ManyToManyField(Int,    related_name='p', blank=True)
    f = models.ManyToManyField(Float,  related_name='p', blank=True)
    s = models.ManyToManyField(String, related_name='p', blank=True)
    u = models.ManyToManyField(User,   related_name='p', blank=True)
    def __str__(self): 
        try: 
            name = self.s.first().v
            if name == 'point': 
                c = self.f.all()
                name += '('+str(c[0].v)+', '+str(c[1].v)+', '+str(c[2].v)+')' 
            return name+' ('+str(self.id)+')'
        except: return 'part ('+str(self.id)+')'

class Account(models.Model): # name it Profile?
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    #viewable = models.OneToOneField(Part, blank=True)
    #editable = models.OneToOneField(Part, blank=True)
    #p = models.ManyToManyField(Part,   related_name='au', blank=True)
    #b = models.ManyToManyField(Bool,   related_name='au', blank=True)
    #i = models.ManyToManyField(Int,    related_name='au', blank=True)
    #f = models.ManyToManyField(Float,  related_name='au', blank=True)
    #s = models.ManyToManyField(String, related_name='au', blank=True)
    #edit_list = models.ForeignKey(Part, default=1, on_delete=models.SET_NULL) # remove models.CASCADE?
    #view_list = 
# @receiver(post_save, sender=User)
# def create_user_profile(sender, instance, created, **kwargs):
#     if created:  Account.objects.create(user=instance)
# @receiver(post_save, sender=User)
# def save_user_profile(sender, instance, **kwargs):
#     instance.account.save()


# class Vector2(models.Model):
#     x = models.ForeignKey(Float, default=1, on_delete=models.CASCADE)
#     y = models.ForeignKey(Float, default=1, on_delete=models.CASCADE)



# class Project(models.Model):
#     id = models.CharField(default=random_id, max_length=16, primary_key=True) # change to TextField with no max_limit max_length=16, 
#     name = models.CharField(default='', max_length=64) # change to TextField with no max_limit TextField
#     story = models.TextField(default='')
#     public = models.BooleanField(default=False)
#     parts = models.ManyToManyField(Part, related_name='projects', blank=True)
#     date_new  = models.DateTimeField(auto_now_add=True) #default=django.utils.timezone.now
#     date_edit = models.DateTimeField(auto_now=True)
#     #file = models.FileField(default='project/default.glb', upload_to='project')
#     #owner = models.ForeignKey(User, default=1, on_delete=models.CASCADE)
#     def __str__(self): return self.name+' ('+os.path.basename(self.file.name)+')'


# # https://stackoverflow.com/questions/16041232/django-delete-filefield
# @receiver(models.signals.post_delete, sender=Project)
# def auto_delete_file_on_delete(sender, instance, **kwargs):
#     """
#     Deletes file from filesystem
#     when corresponding `Project` object is deleted.
#     """
#     if instance.file:
#         if os.path.isfile(instance.file.path):
#             os.remove(instance.file.path)

# @receiver(models.signals.pre_save, sender=Project)
# def auto_delete_file_on_change(sender, instance, **kwargs):
#     """
#     Deletes old file from filesystem
#     when corresponding `Project` object is updated
#     with new file.
#     """
#     if not instance.pk:
#         return False
#     try:
#         old_file = Project.objects.get(pk=instance.pk).file
#     except Project.DoesNotExist:
#         return False
#     new_file = instance.file
#     if not old_file == new_file:
#         if os.path.isfile(old_file.path):
#             os.remove(old_file.path)












# class Atom(models.Model):
#     class Meta: abstract = True
#     parts = models.ManyToManyField(Part, related_name='atoms')
#     def __str__(self): return str(self.val)+' ('+str(self.id)+')'

# class Part(models.Model): 
#     def __str__(self): 
#         try: return self.char_prop_set.get(key=Char_Atom.objects.get(val='name')).atom.val+' ('+str(self.id)+')'
#         except: return 'part ('+str(self.id)+')'

# #class Key(models.Model): 
# #    val = models.CharField(default='', max_length=64)
# #    def __str__(self): return self.val+' ('+str(self.id)+')'

# class Prop(models.Model): 
#     class Meta: abstract = True
#     part = models.ForeignKey(Part, default=1, on_delete=models.CASCADE) #, related_name='part'
#     key  = models.ForeignKey(Char_Atom,  default=1, on_delete=models.CASCADE)

# class Part_Prop(Prop):
#     val = models.ForeignKey(Part, default=1, on_delete=models.CASCADE, related_name='val')

# #class Bool_Prop(Prop):
# #    val  = models.ForeignKey(Bool_Atom, default=0, on_delete=models.CASCADE)

# class Float_Prop(Prop):
#     atom = models.ForeignKey(Float_Atom, default=1, on_delete=models.CASCADE, related_name='atom')

# class Char_Prop(Prop):
#     atom  = models.ForeignKey(Char_Atom, default=0, on_delete=models.CASCADE, related_name='atom')


# class Named(models.Model):
#     class Meta: abstract = True
#     name = models.CharField(max_length=64)

# class Group(Named, Part): pass #vector = models.ForeignKey(Vector, default=0, on_delete=models.CASCADE) 

# class Vector(Named, Part):
#     x = models.FloatField(default=0)
#     y = models.FloatField(default=0)
#     z = models.FloatField(default=0)

# class Line(Part):
#     group = models.ForeignKey(Group, default=0, on_delete=models.CASCADE)
#     point = models.ForeignKey(Vector, default=0, on_delete=models.CASCADE)

# class Sketch(Part):
#     group = models.ForeignKey(Group, default=0, on_delete=models.CASCADE)
#     line  = models.ForeignKey(Line, default=0, on_delete=models.CASCADE)
#     a     = models.ForeignKey(Vector, default=0, on_delete=models.CASCADE, related_name='a') 
#     b     = models.ForeignKey(Vector, default=0, on_delete=models.CASCADE, related_name='b') 

# class Surface(Named, Part):
#     sketch = models.ForeignKey(Sketch, default=0, on_delete=models.CASCADE)








# Probably want polymorphic: https://django-polymorphic.readthedocs.io/en/stable/
