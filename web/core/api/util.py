import hashlib, json, re
from django.db.models import Q
from core.models import Snap, Node

def conform_user_input(s, max_length=-1):#, name=False, slug=False):
    if max_length > -1 and len(s) > max_length: s = s[:max_length]
    #if name: s = re.sub(r'[^A-Za-z0-9 ]+', '', s)
    #if slug: s = re.sub(r'[^A-Za-z0-9]+', '', s)
    return s

def make_node_snaps(commit, node_terms):
    snaps = []
    nodes = []
    for node_id, terms in node_terms.items():
        print('making node snap')
        print(node_id, terms)
        digest = hashlib.sha256(json.dumps(terms, sort_keys=True).encode('utf-8')).hexdigest()
        snap = Snap(digest=digest, content=terms)
        snaps.append(snap)
        nodes.append(Node(commit=commit, key=node_id, snap=snap))
    Snap.objects.bulk_create(snaps, ignore_conflicts=True)
    Node.objects.bulk_create(nodes, 
        update_conflicts = True,
        update_fields = ['snap'],
        unique_fields = ['commit', 'key'],
    )

def split_ids(comp_ids):
    result = {}
    for comp_id in comp_ids:
        commit_id = comp_id[:16]
        node_id   = comp_id[16:]
        if not commit_id in result: 
            result[commit_id] = []
        result[commit_id].append(node_id)
    return result
    
def readable_repo(user):
    return(
        Q(metadata__has_key = 'public') |
        Q(readers = user) |
        Q(commits__metadata__has_key = 'public') |
        Q(commits__readers = user)
    )
def writable_repo(user):
    return Q(writers = user) 
def readable_commit(user):
    return(
        Q(metadata__has_key = 'public') |
        Q(readers = user) |
        Q(repo__metadata__has_key = 'public') |
        Q(repo__readers = user)
    )
def writable_commit(user):
    return (
        (Q(writers = user) | Q(repo__writers = user)) &
        Q(committed = False)
    )
def readable_node(user):
    return(
        Q(commit__metadata__has_key = 'public') |
        Q(commit__readers = user) |
        Q(commit__repo__metadata__has_key = 'public') |
        Q(commit__repo__readers = user)
    )
def writable_node(user):
    return(
        Q(commit__writers = user) |
        Q(commit__repo__writers = user)
    )

