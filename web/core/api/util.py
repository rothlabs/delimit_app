import traceback, hashlib, json, re
from django.db.models import Q
from core.models import Snap, Node, Code_Access
from core.api.config import auth_required_message

def try_mutation(mutate, args, alt):
    try: 
        if not args['user'].is_authenticated:
            return alt(reply = auth_required_message) 
        return mutate(**args)
    except: 
        traceback.print_exc()
        return alt(error='Error')

def try_query(query, args):
    try: 
        return query(**args)
    except:
        traceback.print_exc()
        return None

def is_formal_node_id(s):
    return (s.isalnum() and len(s) == 32)

def conform_user_input(s, max_length=-1):#, name=False, slug=False):
    if max_length > -1 and len(s) > max_length: s = s[:max_length]
    #s = re.sub(r'[^A-Za-z0-9 ]+', '', s) # if slug: s = re.sub(r'[^A-Za-z0-9]+', '', s)
    return s

def make_node_snaps(version, node_terms):
    snaps = []
    nodes = []
    for node_id, terms in node_terms.items():
        digest = hashlib.sha256(json.dumps(terms, sort_keys=True).encode('utf-8')).hexdigest()
        snap = Snap(digest=digest, content=terms)
        snaps.append(snap)
        nodes.append(Node(version=version, key=node_id, snap=snap))
    Snap.objects.bulk_create(snaps, ignore_conflicts=True)
    Node.objects.bulk_create(nodes, 
        update_conflicts = True,
        update_fields = ['snap'],
        unique_fields = ['version', 'key'],
    )

def make_code_keys(nodes, code_node_ids):
    code_keys = {}
    def make_key(id):
        code_access = Code_Access(node=id)
        code_keys[id] = code_access.key
        code_access.save()
    for id in code_node_ids:
        lang = nodes[id]['language'][0]
        if 'value' in lang:
            if lang['value'] == 'javascript': make_key(id)
        elif lang in nodes and 'leaf' in nodes[lang]:
            if 'value' in nodes[lang]['leaf'][0]:
                if nodes[lang]['leaf'][0]['value'] == 'javascript': make_key(id)
    return code_keys

def split_id(comp_id):
    version_id = comp_id[:16]
    node_id    = comp_id[16:]
    return version_id, node_id

def split_ids(comp_ids):
    result = {}
    for comp_id in comp_ids:
        version_id, node_id = split_id(comp_id)
        if not version_id in result: 
            result[version_id] = []
        result[version_id].append(node_id)
    return result
    
def readable_repo(user):
    return(
        Q(metadata__has_key = 'public') |
        Q(readers = user) |
        Q(versions__metadata__has_key = 'public') |
        Q(versions__readers = user)
    )

def writable_repo(user):
    return Q(writers = user) 

def readable_version(user):
    return(
        Q(metadata__has_key = 'public') |
        Q(readers = user) |
        Q(repo__metadata__has_key = 'public') |
        Q(repo__readers = user)
    )

def writable_version(user):
    return (
        (Q(writers = user) | Q(repo__writers = user)) &
        Q(committed = False)
    )

def readable_node(user):
    return(
        Q(version__metadata__has_key = 'public') |
        Q(version__readers = user) |
        Q(version__repo__metadata__has_key = 'public') |
        Q(version__repo__readers = user)
    )
    
def writable_node(user):
    return(
        Q(version__writers = user) |
        Q(version__repo__writers = user)
    )

