import graphene
from core.models import Snap, Repo
from core.api.util import try_mutation, writable_repo

class Edit_Repo(graphene.Mutation):
    class Arguments:
        id = graphene.String()
        name   = graphene.String()
        story  = graphene.String()
        isPublic = graphene.Boolean()
    error = graphene.String() 
    result = graphene.String()
    @classmethod
    def mutate(cls, root, info, id, name, story, isPublic):
        args = {'user':info.context.user, 'id':id, 'name':name, 'story':story, 'isPublic':isPublic}
        return try_mutation(mutate=edit_repo, args=args, alt=Edit_Repo)

def edit_repo(user, id, name, story, isPublic):
    repo = Repo.objects.get(writable_repo(user), id = id)
    repo.metadata |= {'name':name, 'story':story, 'isPublic':isPublic} 
    repo.save()
    return Edit_Repo() 


class Drop_Repo(graphene.Mutation):
    class Arguments:
        id = graphene.String()
    error = graphene.String()
    result = graphene.String()
    @classmethod
    def mutate(cls, root, info, id):
        return try_mutation(mutate=drop_repo, args={'user':info.context.user, 'id':id}, alt=Drop_Repo)

def drop_repo(user, id):
    Repo.objects.filter(writable_repo(user), id=id).delete()
    Snap.objects.filter(nodes=None).delete()
    return Drop_Repo() 