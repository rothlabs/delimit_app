import graphene
from core.api.config import auth_required_message
from core.models import Repo, Snap
from core.api.util import writable_repo

class Drop_Repo(graphene.Mutation):
    class Arguments:
        repoId = graphene.String()
    reply = graphene.String(default_value = 'Failed to drop repo')
    @classmethod
    def mutate(cls, root, info, repoId):
        try:
            user = info.context.user
            if not user.is_authenticated:
                return Drop_Repo(reply = auth_required_message)
            Repo.objects.filter(writable_repo(user), id = repoId).delete()
            Snap.objects.filter(nodes=None).delete()
            return Drop_Repo(reply = 'Drop repo complete')
        except Exception as e: 
            print('Error: Drop_Repo', e)
        return Drop_Repo()