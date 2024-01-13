import json
import graphene
from core.models import Version, Snap
from core.api.util import try_mutation, writable_version, make_node_snaps, is_formal_node_id, make_code_keys

class Make_Nodes(graphene.Mutation):
    class Arguments:
        nodes = graphene.String()
    error = graphene.String() # default_value = 'Failed to make nodes'
    result = graphene.String() #codeKeys = graphene.List(graphene.String)
    @classmethod
    def mutate(cls, root, info, nodes):
        args = {'user':info.context.user, 'raw_nodes':nodes}
        return try_mutation(mutate=make_nodes, args=args, alt=Make_Nodes)

def make_nodes(user, raw_nodes):
    nodes_by_version, code_keys = get_nodes_by_version_and_code_keys(json.loads(raw_nodes))
    for version in filter_versions(nodes_by_version, user):
        make_node_snaps(version, nodes_by_version[version.id])
    Snap.objects.filter(nodes=None).delete()
    result = json.dumps({'code_keys':code_keys})
    return Make_Nodes(result=result) 

# TODO: add metadata to say if we edited source code and would like code_access
def get_nodes_by_version_and_code_keys(nodes): 
    nodes_by_version = {}
    code_keys = {}
    for id, terms in nodes.items():
        if not is_formal_node_id(id): continue
        version_id = id[:16]
        node_id   = id[16:]
        if not version_id in nodes_by_version: 
            nodes_by_version[version_id] = {}
        code_terms = ['source', 'language']
        for term, stems in terms.items():
            if term in code_terms: code_terms.remove(term)
            for index, stem in enumerate(stems):
                if isinstance(stem, str): 
                    if stem[:16] == version_id:
                        terms[term][index] = stem[16:]
        if len(code_terms) == 0: 
            code_keys |= make_code_keys(nodes, [id])
        nodes_by_version[version_id][node_id] = terms
    return nodes_by_version, code_keys

def filter_versions(nodes_by_version, user):
    return Version.objects.filter( 
        writable_version(user),
        id__in = nodes_by_version.keys(), 
    )