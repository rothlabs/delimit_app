import graphene
from core.api.config import auth_required_message
from core.models import Snap, Node
from core.api.util import writable_node, split_ids

class Drop_Nodes(graphene.Mutation):
    class Arguments:
        nodes = graphene.List(graphene.String)
    reply = graphene.String(default_value = 'Failed to drop nodes')
    result = graphene.String()
    @classmethod
    def mutate(cls, root, info, nodes):
        try:
            user = info.context.user
            if not user.is_authenticated:
                return Drop_Nodes(reply = auth_required_message)
            for commit_id, node_ids in split_ids(nodes).items():
                Node.objects.filter(writable_node(user), commit = commit_id, key__in = node_ids).delete()
            Snap.objects.filter(nodes = None).delete()
            return Drop_Nodes(reply = 'drop nodes complete')
        except Exception as e: 
            print('Error, Drop_Nodes, '+str(e))
        return Drop_Nodes()
            