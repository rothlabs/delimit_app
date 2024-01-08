import graphene
from core.models import Snap, Node
from core.api.util import try_mutation, writable_node, split_ids

class Drop_Nodes(graphene.Mutation):
    class Arguments:
        ids = graphene.List(graphene.String)
    reply = graphene.String(default_value = 'Failed to drop nodes')
    result = graphene.String()
    @classmethod
    def mutate(cls, root, info, ids):
        return try_mutation(mutate=drop_nodes, args={'user':info.context.user, 'ids':ids}, alt=Drop_Nodes)

def drop_nodes(user, ids):
    for version_id, node_ids in split_ids(ids).items():
        Node.objects.filter(writable_node(user), version = version_id, key__in = node_ids).delete()
    Snap.objects.filter(nodes = None).delete()
    return Drop_Nodes(reply = 'Dropped nodes')
            