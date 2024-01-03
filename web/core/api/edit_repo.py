import graphene
from core.api.config import auth_required_message
from core.models import Repo
from core.api.util import writable_repo

class Edit_Repo(graphene.Mutation):
    class Arguments:
        id = graphene.String()
        name   = graphene.String()
        story  = graphene.String()
    reply = graphene.String(default_value = 'Failed to edit repo')
    @classmethod
    def mutate(cls, root, info, id, name, story):
        try:
            user = info.context.user
            if not user.is_authenticated:
                return Edit_Repo(reply = auth_required_message)
            repo = Repo.objects.get(writable_repo(user), id = id)
            repo.metadata |= {'name':name, 'story':story} 
            repo.save()
            return Edit_Repo(reply = 'Edit repo complete')
        except Exception as e: 
            print('Error: Edit_Repo', e)
        return Edit_Repo()