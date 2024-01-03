import graphene
from core.api.config import auth_required_message
from core.models import Version
from core.api.util import writable_version

class Edit_Version(graphene.Mutation):
    class Arguments:
        id = graphene.String()
        name   = graphene.String()
        story  = graphene.String()
    reply = graphene.String(default_value = 'Failed to edit version')
    @classmethod
    def mutate(cls, root, info, id, name, story):
        try:
            user = info.context.user
            if not user.is_authenticated:
                return Edit_Version(reply = auth_required_message)
            version = Version.objects.get(writable_version(user), id = id)
            version.metadata |= {'name':name, 'story':story} 
            version.save()
            return Edit_Version(reply = 'Edit version complete')
        except Exception as e: 
            print('Error: Edit_Version', e)
        return Edit_Version()