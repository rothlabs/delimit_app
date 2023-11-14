import re

def conform(s, max_length=-1, name=False, slug=False):
    if max_length > -1 and len(s) > max_length: s = s[:max_length]
    if name: s = re.sub(r'[^A-Za-z0-9 ]+', '', s)
    if slug: s = re.sub(r'[^A-Za-z0-9]+', '', s)
    return s