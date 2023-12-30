import json
import graphene
from django.db.models import Prefetch, Count
from core.api.types import Pack_Type
from core.api.config import auth_required_message
from core.models import Commit, Snap
from core.api.util import writable_commit, make_id


class Drop_Node(graphene.Mutation):
    class Arguments:
        nodes = graphene.String()
    reply = graphene.String(default_value = 'Failed to drop node')
    @classmethod
    def mutate(cls, root, info, nodes):
        try:
            user = info.context.user
            if not user.is_authenticated:
                return Push_Node(reply = auth_required_message)
            commits = normalize_to_commits(json.loads(nodes))
            for commit in filter_commits(commits, user):
                
            return Drop_Node(reply = 'Drop node complete')
        except Exception as e: 
            print('Error: Drop_Node')
            print(e)
            return Drop_Node(reply = 'Error Drop Node: '+str(e))
            
def filter_commits(commits, user):
    return Commit.objects.annotate(stem_count=Count('stems')).prefetch_related(
        'snaps' # Prefetch("snaps", queryset = Snap.objects.filter(node__in = node_ids))
    ).filter( 
        writable_commit(user),
        id__in = commits.keys(), 
    )

def normalize_to_commits(nodes):
    commits = {}
    for comp_id, forw in nodes.items():
        node_id = comp_id[:16]
        commit_id = comp_id[16:]
        if not commit_id in commits: 
            commits[commit_id] = {}
        new_forw = forw.copy()
        for term, stems in forw.items():
            for index, stem in enumerate(stems):
                if isinstance(stem, str): 
                    if stem[16:] == commit_id:
                        new_forw[term][index] = stem[:16]
        commits[commit_id][node_id] = new_forw
    return commits
