import re
from django.utils.crypto import get_random_string

def conform(s, max_length=-1, name=False, slug=False):
    if max_length > -1 and len(s) > max_length: s = s[:max_length]
    if name: s = re.sub(r'[^A-Za-z0-9 ]+', '', s)
    if slug: s = re.sub(r'[^A-Za-z0-9]+', '', s)
    return s

def make_id():
    return get_random_string(length=16)