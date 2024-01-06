import graphene
from core.models import Repo
from core.api.util import attempt, writable_repo

class Edit_Repo(graphene.Mutation):
    class Arguments:
        id = graphene.String()
        name   = graphene.String()
        story  = graphene.String()
    reply = graphene.String(default_value = 'Failed to edit repo')
    result = graphene.String()
    @classmethod
    def mutate(cls, root, info, id, name, story):
        return attempt(Edit_Repo, edit_repo, (info.context.user, id, name, story))

def edit_repo(user, id, name, story):
    repo = Repo.objects.get(writable_repo(user), id = id)
    repo.metadata |= {'name':name, 'story':story} 
    repo.save()
    return Edit_Repo(reply = 'Edit repo complete')