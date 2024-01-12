import json
import graphene
from core.models import Version, Snap
from core.api.util import try_mutation, writable_version, make_node_snaps, is_formal_node_id

class Make_Nodes(graphene.Mutation):
    class Arguments:
        nodes = graphene.String()
    reply = graphene.String(default_value = 'Failed to make nodes')
    result = graphene.String()
    @classmethod
    def mutate(cls, root, info, nodes):
        args = {'user':info.context.user, 'nodes':nodes}
        return try_mutation(mutate=make_nodes, args=args, alt=Make_Nodes)

def make_nodes(user, nodes):
    version_nodes = normalize_ids(json.loads(nodes))
    for version in filter_versions(version_nodes, user):
        make_node_snaps(version, version_nodes[version.id])
    Snap.objects.filter(nodes=None).delete()
    return Make_Nodes(reply = 'Made nodes') 

def normalize_ids(node_terms):
    version_nodes = {}
    for comp_id, terms in node_terms.items():
        if not is_formal_node_id(comp_id): continue
        version_id = comp_id[:16]
        node_id   = comp_id[16:]
        if not version_id in version_nodes: 
            version_nodes[version_id] = {}
        for term, stems in terms.items():
            for index, stem in enumerate(stems):
                if isinstance(stem, str): 
                    if stem[:16] == version_id:
                        terms[term][index] = stem[16:]
        version_nodes[version_id][node_id] = terms
    return version_nodes

def filter_versions(version_nodes, user):
    return Version.objects.filter( 
        writable_version(user),
        id__in = version_nodes.keys(), 
    )