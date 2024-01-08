import graphene
from core.api.util import try_query
from core.api.query_repo import get_repos, get_version
from core.api.login_logout import Login, Logout
from core.api.types import Authenticated_User_Type, Pack_Type

from core.api.make_repo         import Make_Repo, Make_Meta_Repo
from core.api.edit_drop_repo    import Edit_Repo, Drop_Repo
from core.api.edit_drop_version import Edit_Version, Drop_Versions
from core.api.make_nodes        import Make_Nodes
from core.api.drop_nodes        import Drop_Nodes

class Query(graphene.ObjectType):
    user    = graphene.Field(Authenticated_User_Type)
    repos   = graphene.Field(Pack_Type)
    version = graphene.Field(Pack_Type, id=graphene.String())
    def resolve_user(root, info):
        if info.context.user.is_authenticated: return info.context.user
        return None
    def resolve_repos(root, info):
        return try_query(query=get_repos, args={'user':info.context.user}) 
    def resolve_version(root, info, id):
        return try_query(query=get_version, args={'user':info.context.user, 'id':id})

class Mutation(graphene.ObjectType):
    login        = Login.Field()
    logout       = Logout.Field()
    makeRepo     = Make_Repo.Field() 
    makeMetaRepo = Make_Meta_Repo.Field() 
    editRepo     = Edit_Repo.Field() 
    dropRepo     = Drop_Repo.Field() 
    editVersion  = Edit_Version.Field() 
    dropVersions = Drop_Versions.Field() 
    makeNodes    = Make_Nodes.Field()
    dropNodes    = Drop_Nodes.Field()
    
api = graphene.Schema(query=Query, mutation=Mutation)