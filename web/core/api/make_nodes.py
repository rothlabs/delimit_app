import json
import graphene
from core.models import Version, Snap
from core.api.util import (try_mutation, writable_version, make_node_snaps, 
                          is_formal_node_id, make_code_keys, split_id, split_ids)

class Make_Nodes(graphene.Mutation):
    class Arguments:
        nodes = graphene.String()
        includeCodeKeys = graphene.Boolean()
    error = graphene.String() # default_value = 'Failed to make nodes'
    result = graphene.String() #codeKeys = graphene.List(graphene.String)
    @classmethod
    def mutate(cls, root, info, nodes, includeCodeKeys):
        args = {'user':info.context.user, 'nodes':nodes, 'include_code_keys':includeCodeKeys}
        return try_mutation(mutate=make_nodes, args=args, alt=Make_Nodes)

def make_nodes(user, nodes, include_code_keys):
    nodes = json.loads(nodes)
    version_ids = split_ids(nodes).keys()
    versions = Version.objects.filter(writable_version(user), id__in = version_ids)
    nodes, code_node_ids = filter_nodes_and_get_code_node_ids(nodes, version_ids, include_code_keys)
    code_keys = make_code_keys(nodes, code_node_ids)
    nodes_by_version = get_nodes_by_version(nodes)
    for version in versions:
        make_node_snaps(version, nodes_by_version[version.id])
        # version.authors.add(user) # TODO: find correct way to add authors to version
    Snap.objects.filter(nodes=None).delete()
    result = json.dumps({'code_keys':code_keys})
    return Make_Nodes(result=result) 

def filter_nodes_and_get_code_node_ids(nodes, version_ids, include_code_keys):
    filtered_nodes = {}
    code_node_ids = []
    for id, terms in nodes.items():
        if not is_formal_node_id(id): continue
        version_id, _ = split_id(id)
        if not version_id in version_ids: continue
        filtered_nodes[id] = terms
        if include_code_keys:
            code_terms = ['source', 'language']
            for term in terms:
                if term in code_terms: code_terms.remove(term)
            if len(code_terms) == 0: code_node_ids.append(id)
    return filtered_nodes, code_node_ids

def get_nodes_by_version(nodes): 
    nodes_by_version = {}
    for id, terms in nodes.items():
        version_id, node_id = split_id(id)
        if not version_id in nodes_by_version: 
            nodes_by_version[version_id] = {}
        for term, stems in terms.items():
            for index, stem in enumerate(stems):
                if isinstance(stem, str): 
                    if stem[:16] == version_id:
                        terms[term][index] = stem[16:]
        nodes_by_version[version_id][node_id] = terms
    return nodes_by_version