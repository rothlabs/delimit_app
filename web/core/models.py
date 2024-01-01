import os
from django.db import models
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string

def make_id():
    return get_random_string(length=16)

class Snap(models.Model):
    digest  = models.CharField(max_length=64, primary_key=True) 
    content = models.JSONField()  

class Repo(models.Model):
    id        = models.CharField(max_length=16, primary_key=True, default=make_id) 
    readers   = models.ManyToManyField(User, related_name='readable_repos') 
    writers   = models.ManyToManyField(User, related_name='writable_repos') 
    make_time = models.DateTimeField(auto_now_add=True)
    edit_time = models.DateTimeField(auto_now=True)
    metadata  = models.JSONField()

class Commit(models.Model):
    id        = models.CharField(max_length=16, primary_key=True, default=make_id) 
    repo      = models.ForeignKey(Repo,        related_name='commits', on_delete=models.CASCADE) 
    committer = models.ForeignKey(User,        related_name='commits', on_delete=models.SET_NULL, null=True) 
    authors   = models.ManyToManyField(User,   related_name='contributions') 
    readers   = models.ManyToManyField(User,   related_name='readable_commits') 
    writers   = models.ManyToManyField(User,   related_name='writable_commits') 
    roots     = models.ManyToManyField('self', related_name='stems', symmetrical=False)  
    committed = models.BooleanField(default=False)
    make_time = models.DateTimeField(auto_now_add=True)
    edit_time = models.DateTimeField(auto_now=True)
    metadata  = models.JSONField()

class Node(models.Model):
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['commit', 'key'], name='commit_node'),
        ]
    commit = models.ForeignKey(Commit, related_name='nodes', on_delete=models.CASCADE)
    snap   = models.ForeignKey(Snap,   related_name='nodes', on_delete=models.CASCADE)
    key    = models.CharField(max_length=16)