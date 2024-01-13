import graphene
from core.models import Snap, Repo
from core.api.util import try_mutation, writable_repo

class Edit_Repo(graphene.Mutation):
    class Arguments:
        id = graphene.String()
        name   = graphene.String()
        story  = graphene.String()
    error = graphene.String() # default_value = 'Failed to edit repo'
    result = graphene.String()
    @classmethod
    def mutate(cls, root, info, id, name, story):
        args = {'user':info.context.user, 'id':id, 'name':name, 'story':story}
        return try_mutation(mutate=edit_repo, args=args, alt=Edit_Repo)

def edit_repo(user, id, name, story):
    repo = Repo.objects.get(writable_repo(user), id = id)
    repo.metadata |= {'name':name, 'story':story} 
    repo.save()
    return Edit_Repo() # reply = 'Edited repo'


class Drop_Repo(graphene.Mutation):
    class Arguments:
        id = graphene.String()
    reply = graphene.String(default_value = 'Failed to drop repo')
    result = graphene.String()
    @classmethod
    def mutate(cls, root, info, id):
        return try_mutation(mutate=drop_repo, args={'user':info.context.user, 'id':id}, alt=Drop_Repo)

def drop_repo(user, id):
    Repo.objects.filter(writable_repo(user), id=id).delete()
    Snap.objects.filter(nodes=None).delete()
    return Drop_Repo() # reply = 'Dropped repo'