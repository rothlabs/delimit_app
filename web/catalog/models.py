from django.db import models

class Sketch(models.Model):
    name = models.CharField(max_length=64)
    svg = models.TextField()

class Product(models.Model):
    name = models.CharField(max_length=64)
    publish_date = models.DateTimeField()
    top_sketch = models.ForeignKey(Sketch, related_name='top_sketch', default='', on_delete=models.CASCADE)
    side_sketch = models.ForeignKey(Sketch, related_name='side_sketch', default='', on_delete=models.CASCADE)
    heel_height = models.FloatField(default=0)
    glb = models.FileField(upload_to='glb', default='glb/default.glb')