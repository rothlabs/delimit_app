import graphene
from graph.database import gdbc, gdb_connect
from core.api.config import auth_required_message
from core.models import Package

class Drop_Package(graphene.Mutation):
    class Arguments:
        team = graphene.String()
        package = graphene.String()
    reply = graphene.String(default_value = 'Failed to drop package')
    @classmethod
    def mutate(cls, root, info, team, package):
        try:
            user = info.context.user
            if not user.is_authenticated:
                return Drop_Package(reply = auth_required_message)
            team = gdb_connect(user, team=team)
            gdbc.delete_database(package, team)
            Package.objects.get(package = package).delete()
            return Drop_Package(reply = 'Dropped package')
        except Exception as e: 
            print('Error: Drop_Package')
            print(e)
        return Drop_Package()