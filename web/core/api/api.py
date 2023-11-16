import graphene
from graph.database import gdbc, gdb_connect
from terminus import WOQLQuery as wq # terminusdb_client
from core.api.login import Login
from core.api.logout import Logout
from core.api.open_nodes import Open_Nodes
from core.api.push_nodes import Push_Nodes
from core.api.drop_repo import Drop_Repo
from core.api.make_repo import Make_Repo
from core.api.types import Authenticated_User_Type, Pack_Type
from core.models import Repo

class Query(graphene.ObjectType):
    user = graphene.Field(Authenticated_User_Type)
    repos = graphene.Field(Pack_Type)
    def resolve_user(root, info):
        if info.context.user.is_authenticated: 
            return info.context.user
        else: 
            return None
    def resolve_repos(root, info):
        try:
            gdb_connect(info.context.user)
            databases = gdbc.get_databases()
            repos = Repo.objects.filter(repo__in=[p['name'] for p in databases]) # p['name'] is the id
            result = []
            for p in repos:
                result.append({
                    'team': p.team,
                    'repo': p.repo, 
                    'name': p.name, 
                    'description': p.description,
                })
            return Pack_Type(data = {'list':result})
        except Exception as e: 
            print('Error: Query repos') 
            print(e)
        return None

class Mutation(graphene.ObjectType):
    login = Login.Field()
    logout = Logout.Field()
    makeRepo = Make_Repo.Field()
    dropRepo = Drop_Repo.Field()
    openNodes = Open_Nodes.Field()
    pushNodes = Push_Nodes.Field()

api = graphene.Schema(query=Query, mutation=Mutation)




    

# GRAPH = settings.GRAPH
# graph.schema = json.loads(requests.get(
#     'http://'+GRAPH['user']+':'+GRAPH['password']+'@'+GRAPH['host']+':'+GRAPH['port']
#     +'/api/schema/'+GRAPH['user']+'/'+GRAPH['database']
# ).text)


    # def resolve_library(root, info):
    #     try:
    #         # user = info.context.user
    #         # if user.is_authenticated:
    #         # sub_schema = graph.schema.copy()
    #         # for k in ['@context']: # 'Open_Assets', 'Poll_Pack' 'Boolean', 'Integer', 'Decimal', 'String', 
    #         #     del sub_schema[k]
    #         # return Pack_Type(data = sub_schema)
    #     except Exception as e: 
    #         print('get schema error') 
    #         print(e)
    #     return None


# admin_classes = {} 
# for k in graph.schema:
#     if '@inherits' in graph.schema[k]:
#         if 'Admin' == graph.schema[k]['@inherits'] or 'Admin' in graph.schema[k]['@inherits']:
#             admin_classes[k] = True


#from terminusdb_client import Client
#from graphene_file_upload.scalars import Upload  # for uploading files like 3d models
#from django.db import connection  # for raw SQL on relational db



            # triples = wq().woql_and(
            #     wq().triple('v:root', 'rdf:type', '@schema:Public'),
            #     # wq().woql_or(
            #     #     wq().triple('v:root', 'rdf:type',     'v:stem'),
            #     #     wq().triple('v:root', '@schema:view', 'v:stem'),
            #     # ),
            #     wq().triple('v:root', 'v:tag', 'v:stem'),
            # ).execute(graph.client)['bindings']
            # triples += wq().select('v:root', 'v:tag', 'v:stem').woql_and(
            #     wq().triple('v:public', 'rdf:type', '@schema:Public'),
            #     wq().triple('v:public', '@schema:view', 'v:root'),
            #     wq().triple('v:root', 'v:tag', 'v:stem'),
            # ).execute(graph.client)['bindings'] # might not return bindings if nothing found?! #1

#exclude_classes = ['Open_Assets', 'Poll_Pack'] # 'Boolean', 'Integer', 'Decimal', 'String', 
#triples = graph.client.get_all_documents(graph_type='schema', as_list=True)[1:] 
#triples = filter(lambda n: n['@id'] not in exclude_classes, triples)
#return Pack_Type(data = {'list':list(triples)}) 



#from core.models import Part_Part, Part_Bool, Part_Int, Part_Float, Part_String, Part_User
#from django.db.models import Q, Count

#pollPack = graphene.Field(Pack_Type, instance=graphene.String())

# def resolve_pollPack(root, info, instance): 
#         try:
#             # user = info.context.user
#             # if user.is_authenticated:
#             #     #String.objects.annotate(parts=Count('p')).filter(parts__lt=1).delete()
#             #     Int.objects.filter(e__t__v='system_time', v__lt=int(time.time())-6).delete() # delete if 4 seconds old! make client pull everything if disconnects for more than 4 seconds
#             #     Part.objects.filter(~Q(ie__t__v='system_time'), t__v='poll_pack').delete()
#             #     #String.objects.filter(~Q(e__t__v='client_instance'), p__in=old_poll_packs).delete() 
#             #     #old_poll_packs.delete()

#             #     #open_pack = Part.objects.get(t__v='open_pack', u=user).id
#             #     #poll_packs = Part.objects.filter(~Q(s__v=instance), t__v='poll_pack')

#             #     op_id = Part.objects.get(t__v='open_pack', u=user).id
#             #     dp_ids = tuple(Part.objects.filter(~Q(s__v=instance), t__v='delete_pack').values_list('id')) or ('',)
#             #     #tuple([pp.id for pp in Part.objects.filter(~Q(s__v=instance), t__v='delete_pack')] + ['none'])

#             #     params = {
#             #         'op': op_id,
#             #         'pp': tuple([pp.id for pp in Part.objects.filter(~Q(s__v=instance), t__v='poll_pack')] + ['none']),
#             #         'opt': tag['open_pack'].id,
#             #         'dp': dp_ids,
#             #     }

#             #     # skip if pp is none?
#             #     # check if not in delete_pack
#             #     parts = Part.objects.raw(select_p   # need to check if still under profile as asset ?!?!?!?!?!
#             #         +"n.t_id != 'none' AND "
#             #         +exists_p+'e.r_id = %(op)s) AND'
#             #         +exists_p+'e.r_id IN %(pp)s) AND '
#             #         +'NOT'+exists_p+'e.r_id IN %(dp)s)'
#             #     ,params)
#             #     bools = Bool.objects.raw(select_b
#             #         +exists_b+'e.r_id = %(op)s) AND'
#             #         +exists_b+'e.r_id IN %(pp)s) AND '
#             #         +'NOT'+exists_b+'e.r_id IN %(dp)s)'
#             #     ,params)
#             #     ints = Int.objects.raw(select_i
#             #         +exists_i+'e.r_id = %(op)s) AND'
#             #         +exists_i+'e.r_id IN %(pp)s) AND '
#             #         +'NOT'+exists_i+'e.r_id IN %(dp)s)'
#             #     ,params)
#             #     floats = Float.objects.raw(select_f
#             #         +exists_f+'e.r_id = %(op)s) AND'
#             #         +exists_f+'e.r_id IN %(pp)s) AND '
#             #         +'NOT'+exists_f+'e.r_id IN %(dp)s)'
#             #     ,params)
#             #     strings = String.objects.raw(select_s
#             #         +exists_s+'e.r_id = %(op)s) AND'
#             #         +exists_s+'e.r_id IN %(pp)s) AND '
#             #         +'NOT'+exists_s+'e.r_id IN %(dp)s)'
#             #     ,params)

#             #     old_delete_packs = Part.objects.filter(~Q(ie__t__v='system_time'), t__v='delete_pack')
#             #     Part.objects.filter(r__in=old_delete_packs).delete()
#             #     Bool.objects.filter(p__in=old_delete_packs).delete()
#             #     Int.objects.filter(p__in=old_delete_packs).delete()
#             #     Float.objects.filter(p__in=old_delete_packs).delete()
#             #     String.objects.filter(~Q(e__t__v='client_instance'), p__in=old_delete_packs).delete() #  temp disable so client instance string does not get deleted!!!!
#             #     old_delete_packs.delete()
#             #     params = {
#             #         'op': op_id,
#             #         'dp': dp_ids,
#             #         'dp': dp_ids,
#             #     }
#             #     # skip if dp is none?
#             #     d_parts = Part.objects.raw("""SELECT core_part.id, core_part.t_id FROM core_part WHERE
#             #         EXISTS (SELECT core_part_part.id FROM core_part_part WHERE core_part_part.n_id=core_part.id AND core_part_part.r_id = %(op)s) AND
#             #         EXISTS (SELECT core_part_part.id FROM core_part_part WHERE core_part_part.n_id=core_part.id AND core_part_part.r_id IN %(dp)s) 
#             #     """, params)
#             #     d_bools = Bool.objects.raw("""SELECT core_bool.id, core_bool.v FROM core_bool WHERE
#             #         EXISTS (SELECT core_part_bool.id FROM core_part_bool WHERE core_part_bool.n_id=core_bool.id AND core_part_bool.r_id = %(op)s) AND
#             #         EXISTS (SELECT core_part_bool.id FROM core_part_bool WHERE core_part_bool.n_id=core_bool.id AND core_part_bool.r_id IN %(dp)s) 
#             #     """, params)
#             #     d_ints = Int.objects.raw("""SELECT core_int.id, core_int.v FROM core_int WHERE
#             #         EXISTS (SELECT core_part_int.id FROM core_part_int WHERE core_part_int.n_id=core_int.id AND core_part_int.r_id = %(op)s) AND
#             #         EXISTS (SELECT core_part_int.id FROM core_part_int WHERE core_part_int.n_id=core_int.id AND core_part_int.r_id IN %(dp)s) 
#             #     """, params)
#             #     d_floats = Float.objects.raw("""SELECT core_float.id, core_float.v FROM core_float WHERE
#             #         EXISTS (SELECT core_part_float.id FROM core_part_float WHERE core_part_float.n_id=core_float.id AND core_part_float.r_id = %(op)s) AND
#             #         EXISTS (SELECT core_part_float.id FROM core_part_float WHERE core_part_float.n_id=core_float.id AND core_part_float.r_id IN %(dp)s) 
#             #     """, params)
#             #     d_strings = String.objects.raw("""SELECT core_string.id, core_string.v FROM core_string WHERE
#             #         EXISTS (SELECT core_part_string.id FROM core_part_string WHERE core_part_string.n_id=core_string.id AND core_part_string.r_id = %(op)s) AND
#             #         EXISTS (SELECT core_part_string.id FROM core_part_string WHERE core_part_string.n_id=core_string.id AND core_part_string.r_id IN %(dp)s) 
#             #     """, params)

#                 #return Pack_Type(triples=result['bindings'])
#             return None
#         except Exception as e: 
#             print('poll_pack error') 
#             print(e)
#         return None




# system_tags = ['user', 'profile', 'open_pack', 'poll_pack', 'delete_pack', 'client_instance', 'system_time']
# tag = {t: Tag.objects.get_or_create(v=t, system=(t in system_tags))[0] for t in [ # put all this in config file
#     'user', 'open_pack', 'poll_pack', 'delete_pack', 'client_instance', 'system_time', 'part',  
#     'viewable', 'asset',
#     'profile',
#     'public', 
#     'product', 'point', 'curve', 'ellipse', 'sketch', 'group', 'transform', # 'repeater', 
#     'surface', 'shape', 'layer', 'image',
#     'x', 'y', 'z', 'move_x', 'move_y', 'move_z', 'turn_x', 'turn_y', 'turn_z', 'scale_x', 'scale_y', 'scale_z', 
#     'radius_a', 'radius_b', 'angle_a', 'angle_b', 'axis_x', 'axis_y', 'axis_z',
#     'width', 'height', 'data',
#     'name', 'story',
#     'post',
#     'fill', 'corner',
#     'order', 'current_image',
#     'brush', 'color_a', 'color_b',
#     'stroke',
#     'material', 'fiber',
#     'slice', 'coil', 'axial', 'cord_radius', 'speed', 'flow', 'axes', 'spread_angle', 'layers', 
#     'repeats', #'speed_curve', # 'slows', #'clearance',
#     'slice_spacing', 'slice_offset', 'layer_spacing', 'layer_offset',
#     'machine', 'origin_x', 'origin_y', 'origin_z', 'origin_a',
#     'holder_y', 'holder_x1', 'holder_x2', 'holder_x3', 'holder_x4', 'holder_x5',
#     'offset_x1', 'offset_x2', 'offset_x3', 'offset_x4', 'offset_x5', #'offset_a',
#     'fluid_z',
#     'offset', 'density',
#     'guide', 'mix',
#     'target',
#     'visible', 'autocalc',
#     'plane',
#     'view_move_x', 'view_move_y', 'view_move_z', 'view_turn_x', 'view_turn_y', 'view_turn_z',
#     'face_viewer',
# ]} # 'mixed_curve', 
# cats = tuple(Part.objects.get_or_create(t=tag[t])[0].id for t in [
#     'public', #'manual_compute', # 'top_view', 'side_view', 'auxiliary', 'face_camera', 'manual_compute', #'front_view',
#     #'fill', 'corner',
# ])
# perm_tag = tuple(tag[t].id for t in ['viewable', 'asset',])

# class Authenticated_User_Type(DjangoObjectType):
#     class Meta:
#         model = User
#         fields = ('id', 'username', 'first_name', 'last_name', 'email',)
# class User_Type(DjangoObjectType):
#     class Meta:
#         model = User
#         fields = ('id', 'first_name',)
# class Tag_Type(DjangoObjectType):
#     class Meta:
#         model = Tag
#         fields = '__all__'
# # class Schema_Type(graphene.ObjectType):
# #     content = graphene.String()
# #     def resolve_full(self, info): 
# #         return json.dumps({'docs':graph.get_all_documents(graph_type='schema', as_list=True)}) 
# class Part_Type(graphene.ObjectType): 
#     id = graphene.ID()
#     t = graphene.ID()
#     def __init__(self, n): self.n=n
#     def resolve_id(self, info): return self.n.id
#     def resolve_t(self, info): return self.n.t_id
# class Atom_Type(graphene.ObjectType):
#     id = graphene.ID()
#     def resolve_id(self, info): return self.n.id 
# class Bool_Type(Atom_Type):
#     v = graphene.Boolean()
#     def __init__(self, n): self.n=n
#     def resolve_v(self, info): return self.n.v 
# class Int_Type(Atom_Type):
#     v = graphene.Int()
#     def __init__(self, n): self.n=n
#     def resolve_v(self, info): return self.n.v 
# class Float_Type(Atom_Type):
#     v = graphene.Float()
#     def __init__(self, n): self.n=n
#     def resolve_v(self, info): return self.n.v 
# class String_Type(Atom_Type):
#     v = graphene.String()
#     def __init__(self, n): self.n=n
#     def resolve_v(self, info): return self.n.v 
# class Edge_Type(graphene.ObjectType): 
#     r = graphene.ID()
#     t = graphene.ID()
#     n = graphene.ID()
#     def __init__(self, e): self.e = e
#     def resolve_r(self, info): return self.e.r_id
#     def resolve_t(self, info): return self.e.t_id
#     def resolve_n(self, info): return self.e.n_id

# def clear_part(part):
#     part.p.clear()
#     part.b.clear()
#     part.i.clear()
#     part.f.clear()
#     part.s.clear()

# select_p = ' SELECT n.id, n.t_id FROM core_part n WHERE '
# select_b = ' SELECT n.id, n.v FROM core_bool n WHERE '
# select_i = ' SELECT n.id, n.v FROM core_int n WHERE '
# select_f = ' SELECT n.id, n.v FROM core_float n WHERE '
# select_s = ' SELECT n.id, n.v FROM core_string n WHERE '
# exists_p = ' EXISTS (SELECT e.id FROM core_part_part e WHERE e.n_id=n.id AND '
# exists_b = ' EXISTS (SELECT e.id FROM core_part_bool e WHERE e.n_id=n.id AND '
# exists_i = ' EXISTS (SELECT e.id FROM core_part_int e WHERE e.n_id=n.id AND '
# exists_f = ' EXISTS (SELECT e.id FROM core_part_float e WHERE e.n_id=n.id AND '
# exists_s = ' EXISTS (SELECT e.id FROM core_part_string e WHERE e.n_id=n.id AND '