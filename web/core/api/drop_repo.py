import graphene
from core.models import Repo, Snap
from core.api.util import attempt, writable_repo

class Drop_Repo(graphene.Mutation):
    class Arguments:
        id = graphene.String()
    reply = graphene.String(default_value = 'Failed to drop repo')
    result = graphene.String()
    @classmethod
    def mutate(cls, root, info, id):
        return attempt(Drop_Repo, drop_repo, (info.context.user, id))

def drop_repo(user, id):
    Repo.objects.filter(writable_repo(user), id=id).delete()
    Snap.objects.filter(nodes=None).delete()
    return Drop_Repo(reply = 'Drop repo complete')