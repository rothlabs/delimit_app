import re
import graphene
from graph.database import gdbc, gdb_connect
from core.api.config import auth_required_message
from terminusdb_client import WOQLQuery as wq
from django.utils.crypto import get_random_string
from core.api.util import conform
from core.models import Package

class Make_Package(graphene.Mutation):
    class Arguments:
        team = graphene.String()
        name = graphene.String()
        description = graphene.String()
    reply = graphene.String(default_value = 'Failed to make package')
    @classmethod
    def mutate(cls, root, info, team, name, description):
        try:
            user = info.context.user
            if not user.is_authenticated:
                return Make_Package(reply = auth_required_message)
            team = gdb_connect(user, team=team)
            name = conform(name, max_length=64, name=True)
            package = get_random_string(length=16) 
            description = conform(description, max_length=512)
            prefixes = {'@base' : 'iri:///'+package+'/', '@schema':'iri:///'+package+'#'}
            gdbc.create_database(
                package, # name
                team, 
                label = name,
                description = description, # comment
                prefixes = prefixes,
                include_schema = False,
            )
            Package.objects.create(
                package = package,
                team = team,
                name = name,
                description = description,
            )
            return Make_Package(reply = 'Made package')
        except Exception as e: 
            print('Error: Make_Package')
            print(e)
        return Make_Package()


            # gdbc.change_capabilities({
            #     "operation": "grant",
            #     "scope": gdb_user,
            #     "scope_type": "organization",
            #     "user": gdb_user,
            #     "roles": [
            #         "Admin Role"
            #     ]
            # })


#slug = get_random_string(length=32) #  conform(label, slug=True) 
#dbid = slug + '/' + get_random_string(length=32)


# from copy import deepcopy