import re
from django.utils.crypto import get_random_string
from django.db.models import Q

def conform(s, max_length=-1, name=False, slug=False):
    if max_length > -1 and len(s) > max_length: s = s[:max_length]
    if name: s = re.sub(r'[^A-Za-z0-9 ]+', '', s)
    if slug: s = re.sub(r'[^A-Za-z0-9]+', '', s)
    return s

def make_id():
    return get_random_string(length=16)

def readable_repo(user):
    return Q(flex__has_key = 'public') | Q(readers = user) | Q(commits__flex__has_key = 'public') | Q(commits__readers = user) 

def readable_commit(user):
    return Q(flex__has_key = 'public') | Q(readers = user) | Q(repo__flex__has_key = 'public') | Q(repo__readers = user) 