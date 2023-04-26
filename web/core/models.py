import os
from django.db import models
from django.dispatch import receiver
import django.utils
from django.utils.crypto import get_random_string
from django.contrib.auth.models import User
from django.db.models.signals import post_save

# ntc = {
#     'name':     'LWTFvT6MaxB6CszA',
#     'public':   'JMUGkRCzV3C7V0Qf', 
#     'viewable': 'CAOXNrjlhYjWtG8q', 
#     'editable': 'kAbLj0N34E0HhCnQ',
# }
# ctn = {ntc[n]:n for n in list(ntc.keys())}

def make_id(): return get_random_string(length=16)

class Id(models.Model):
    class Meta: abstract = True
    id = models.CharField(default=make_id, max_length=16, primary_key=True)
class Atom(models.Model):
    class Meta: abstract = True
    def __str__(self): return str(self.v)+' ('+str(self.id)+')'

class Tag(Id):    
    v = models.CharField(default='', blank=True, max_length=128)
    system = models.BooleanField(default=False)
    def __str__(self): 
        system_text = ' '
        if self.system: system_text = 'SYSTEM'
        return str(self.v)+' '+system_text+' ('+str(self.id)+')'
class Bool(Id, Atom):   v = models.BooleanField(default=False)
class Int(Id, Atom):    v = models.IntegerField(default=0)
class Float(Id, Atom):  v = models.FloatField(default=0)
class String(Id, Atom): v = models.TextField(default='', blank=True)
#class Time(Id, Atom):   v = models.DateTimeField(default=django.utils.timezone.now) 
    # def __str__(self): 
    #     display = self.v
    #     if display in ctn: display = ctn[display]+' : '+self.v
    #     return display+' ('+str(self.id)+')'

#def default_tag(): return Tag.objects.get(v='')

class Part(Id): # p for part, u for user (a part that is using this part)
    t    = models.ForeignKey(Tag, related_name='p', null=True, on_delete=models.SET_NULL)#, through='Part_Tag') #  through_fields=('p','t')
    p    = models.ManyToManyField('self', related_name='r', blank=True, through='Part_Part', symmetrical=False) #related_name='r', 
    #t    = models.ManyToManyField(Tag,    related_name='p', blank=True, through='Part_Tag')#, through='Part_Tag') #  through_fields=('p','t')
    b    = models.ManyToManyField(Bool,   related_name='p', blank=True, through='Part_Bool')
    i    = models.ManyToManyField(Int,    related_name='p', blank=True, through='Part_Int')
    f    = models.ManyToManyField(Float,  related_name='p', blank=True, through='Part_Float')
    s    = models.ManyToManyField(String, related_name='p', blank=True, through='Part_String')
    u    = models.ManyToManyField(User,   related_name='p', blank=True, through='Part_User')
    #time = models.ManyToManyField(Time,   related_name='p', blank=True, through='Part_Time')
    def __str__(self): 
        try:
            return str(self.t.v)+' ('+str(self.id)+')' #' '.join(list(self.t.order_by('pt__n').values_list('v',flat=True))) + ' ('+str(self.id)+')' 
        except Exception as e: print(e)
        return 'part' + ' ('+str(self.id)+')'

class Through(models.Model): 
    class Meta: abstract = True
    n = models.IntegerField(default=0) # order (look into PositiveIntegerField)
    def __str__(self): 
        tag1_name = ''
        tag2_name = ''
        if self.t1: tag1_name = str(self.t1.v) + ' ('+str(self.m1.id)+')'
        if self.t2: tag2_name = str(self.t2.v) + ' ('+str(self.m2.id)+')'
        return ''+tag1_name+' <--->> '+tag2_name+' ('+str(self.id)+')'
 
class Part_Part(Through):
    t1 = models.ForeignKey(Tag,  related_name='pp1', null=True, blank=True, on_delete=models.SET_NULL)
    m1 = models.ForeignKey(Part, related_name='pp1', on_delete=models.CASCADE)
    t2 = models.ForeignKey(Tag,  related_name='pp2', null=True, blank=True, on_delete=models.SET_NULL)
    m2 = models.ForeignKey(Part, related_name='pp2', on_delete=models.CASCADE)
#class Part_Tag(Through):
#    m1 = models.ForeignKey(Part, related_name='pt1', on_delete=models.CASCADE)
#    m2 = models.ForeignKey(Tag,  related_name='pt2', on_delete=models.CASCADE, null=True)
class Part_Bool(Through):
    t1 = models.ForeignKey(Tag,  related_name='pb1', null=True, blank=True, on_delete=models.SET_NULL)
    m1 = models.ForeignKey(Part, related_name='pb1', on_delete=models.CASCADE)
    t2 = models.ForeignKey(Tag,  related_name='pb2', null=True, blank=True, on_delete=models.SET_NULL)
    m2 = models.ForeignKey(Bool, related_name='pb2', on_delete=models.CASCADE)
class Part_Int(Through):
    t1 = models.ForeignKey(Tag,  related_name='pi1', null=True, blank=True, on_delete=models.SET_NULL)
    m1 = models.ForeignKey(Part, related_name='pi1', on_delete=models.CASCADE)
    t2 = models.ForeignKey(Tag,  related_name='pi2', null=True, blank=True, on_delete=models.SET_NULL)
    m2 = models.ForeignKey(Int,  related_name='pi2', on_delete=models.CASCADE)
class Part_Float(Through):
    t1 = models.ForeignKey(Tag,   related_name='pf1', null=True, blank=True, on_delete=models.SET_NULL)
    m1 = models.ForeignKey(Part,  related_name='pf1', on_delete=models.CASCADE)
    t2 = models.ForeignKey(Tag,   related_name='pf2', null=True, blank=True, on_delete=models.SET_NULL)
    m2 = models.ForeignKey(Float, related_name='pf2', on_delete=models.CASCADE)
class Part_String(Through):
    t1 = models.ForeignKey(Tag,    related_name='ps1', null=True, blank=True, on_delete=models.SET_NULL)
    m1 = models.ForeignKey(Part,   related_name='ps1', on_delete=models.CASCADE)
    t2 = models.ForeignKey(Tag,    related_name='ps2', null=True, blank=True, on_delete=models.SET_NULL)
    m2 = models.ForeignKey(String, related_name='ps2', on_delete=models.CASCADE)
class Part_User(Through):
    t1 = models.ForeignKey(Tag,  related_name='pu1', null=True, blank=True, on_delete=models.SET_NULL)
    m1 = models.ForeignKey(Part, related_name='pu1', on_delete=models.CASCADE)
    t2 = models.ForeignKey(Tag,  related_name='pu2', null=True, blank=True, on_delete=models.SET_NULL)
    m2 = models.ForeignKey(User, related_name='pu2', on_delete=models.CASCADE)
# class Part_Time(Through):
#     p    = models.ForeignKey(Part, related_name='pTime', on_delete=models.CASCADE)
#     t    = models.ForeignKey(Tag, related_name='pTime', on_delete=models.CASCADE, null=True)
#     time = models.ForeignKey(Time, related_name='pTime', on_delete=models.CASCADE)


#class Account(models.Model): # name it Profile?
#    user = models.OneToOneField(User, on_delete=models.CASCADE)
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
