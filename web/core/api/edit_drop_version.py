import graphene
from core.models import Snap, Version
from core.api.util import try_mutation, writable_version

class Edit_Version(graphene.Mutation):
    class Arguments:
        id = graphene.String()
        name   = graphene.String()
        story  = graphene.String()
    error = graphene.String() # default_value = 'Failed to edit version'
    result = graphene.String()
    @classmethod
    def mutate(cls, root, info, id, name, story):
        args = {'user':info.context.user, 'id':id, 'name':name, 'story':story}
        return try_mutation(mutate=edit_version, args=args, alt=Edit_Version)

def edit_version(user, id, name, story):
    version = Version.objects.get(writable_version(user), id = id)
    version.metadata |= {'name':name, 'story':story} 
    version.save()
    return Edit_Version() 

class Drop_Versions(graphene.Mutation):
    class Arguments:
        ids = graphene.List(graphene.String)
    reply = graphene.String(default_value = 'Failed to drop version')
    result = graphene.String()
    @classmethod
    def mutate(cls, root, info, ids):
        return try_mutation(mutate=drop_versions, args={'user':info.context.user, 'ids':ids}, alt=Drop_Versions)

def drop_versions(user, ids):
    Version.objects.filter(writable_version(user), id__in=ids).delete()
    Snap.objects.filter(nodes=None).delete()
    return Drop_Versions() 