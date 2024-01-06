import graphene
from core.models import Version
from core.api.util import attempt, writable_version

class Edit_Version(graphene.Mutation):
    class Arguments:
        id = graphene.String()
        name   = graphene.String()
        story  = graphene.String()
    reply = graphene.String(default_value = 'Failed to edit version')
    result = graphene.String()
    @classmethod
    def mutate(cls, root, info, id, name, story):
        return attempt(Edit_Version, edit_version, (info.context.user, id, name, story))

def edit_version(user, id, name, story):
    version = Version.objects.get(writable_version(user), id = id)
    version.metadata |= {'name':name, 'story':story} 
    version.save()
    return Edit_Version(reply = 'Edit version complete')