import json, time, hashlib
import graphene
from django.db.models import Count # Prefetch
from core.api.types import Pack_Type
from core.api.config import auth_required_message
from core.models import Commit, Snap
from core.api.util import writable_commit, make_node_snaps

class Make_Nodes(graphene.Mutation):
    class Arguments:
        nodes = graphene.String()
    reply = graphene.String(default_value = 'Failed to make nodes')
    result = graphene.String()
    @classmethod
    def mutate(cls, root, info, nodes):
        try: 
            user = info.context.user
            if not user.is_authenticated:
                return Make_Nodes(reply = auth_required_message)
            commit_nodes = normalize_ids(json.loads(nodes))
            for commit in filter_commits(commit_nodes, user):
                make_node_snaps(commit, commit_nodes[commit.id])
            Snap.objects.filter(nodes=None).delete()
            return Make_Nodes(reply = 'Make nodes successful') 
        except Exception as e: 
            print('Error: Make_Nodes', str(e))
            return Make_Nodes()

def normalize_ids(node_terms):
    commit_nodes = {}
    for comp_id, terms in node_terms.items():
        commit_id = comp_id[:16]
        node_id   = comp_id[16:]
        if not commit_id in commit_nodes: 
            commit_nodes[commit_id] = {}
        for term, stems in terms.items():
            for index, stem in enumerate(stems):
                if isinstance(stem, str): 
                    if stem[:16] == commit_id:
                        terms[term][index] = stem[16:]
        commit_nodes[commit_id][node_id] = terms
    return commit_nodes

def filter_commits(commit_nodes, user):
    return Commit.objects.filter( 
        writable_commit(user),
        id__in = commit_nodes.keys(), 
    )