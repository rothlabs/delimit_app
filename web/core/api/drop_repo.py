import graphene
from core.models import Repo, Snap
from core.api.util import try_mutation, writable_repo

class Drop_Repo(graphene.Mutation):
    class Arguments:
        id = graphene.String()
    error = graphene.String() # default_value = 'Failed to drop repo'
    result = graphene.String()
    @classmethod
    def mutate(cls, root, info, id):
        return try_mutation(mutate=drop_repo, args={'user':info.context.user, 'id':id}, alt=Drop_Repo)

def drop_repo(user, id):
    Repo.objects.filter(writable_repo(user), id=id).delete()
    Snap.objects.filter(nodes=None).delete()
    return Drop_Repo() # reply = 'Drop repo complete'