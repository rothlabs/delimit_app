import graphene
from graph.database import gdbc, gdb_connect
from core.api.config import auth_required_message
from core.models import Repo

class Drop_Repo(graphene.Mutation):
    class Arguments:
        client = graphene.String()
        repo   = graphene.String()
    reply = graphene.String(default_value = 'Failed to drop repo')
    @classmethod
    def mutate(cls, root, info, client, repo):
        try:
            user = info.context.user
            if not user.is_authenticated:
                return Drop_Repo(reply = auth_required_message)
            team = Repo.objects.get(repo=repo).team
            team, gdb_user = gdb_connect(user, team=team)
            gdbc.delete_database(repo, team)
            Repo.objects.get(repo = repo).delete()
            return Drop_Repo(reply = 'Drop repo complete')
        except Exception as e: 
            print('Error: Drop_Repo')
            print(e)
        return Drop_Repo()