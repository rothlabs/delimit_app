import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth.models import User
from core.models import make_id, Part, Tag, Bool, Int, Float, String
from core.models import Part_Part, Part_Bool, Part_Int, Part_Float, Part_String, Part_User
#from core.models import tag, perm_tag, cats
from django.db.models import Q, Count
from django.contrib.auth import authenticate, login, logout
from graphene_file_upload.scalars import Upload
import django.utils
import time
from django.db import connection


system_tags = ['user', 'profile', 'open_pack', 'poll_pack', 'delete_pack', 'client_instance', 'system_time']
tag = {t: Tag.objects.get_or_create(v=t, system=(t in system_tags))[0] for t in [ # put all this in config file
    'user', 'open_pack', 'poll_pack', 'delete_pack', 'client_instance', 'system_time', 'part',  
    'viewable', 'asset',
    'profile',
    'public', 'top_view', 'side_view', 'auxiliary', 'face_camera', 'manual_compute', #'front_view',  'inner_view', 'outer_view', 'guide',
    'product', 'point', 'curve', 'ellipse', 'sketch', 'repeater', 'group', 'transform', 
    'mixed_curve', 'surface', 'shape', 'layer', 'image',
    'x', 'y', 'z', 'move_x', 'move_y', 'move_z', 'turn_x','turn_y','turn_z', 'scale_x','scale_y','scale_z', 
    'radius_a', 'radius_b', 'angle_a', 'angle_b', 'axis_x', 'axis_y', 'axis_z',
    'width', 'height', 'image_code',
    'name', 'story',
    'coil', 'post',
    'fill',
    'density', 'nozzle_diameter', 'speed', 'flow', 'axis_count', 'axis_angle', 'layer_count',
]}
cats = tuple(Part.objects.get_or_create(t=tag[t])[0].id for t in [
    'public', 'top_view', 'side_view', 'auxiliary', 'face_camera', 'manual_compute', #'front_view',
    'fill',
])
perm_tag = tuple(tag[t].id for t in ['viewable', 'asset',])

class Authenticated_User_Type(DjangoObjectType):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email',)
class User_Type(DjangoObjectType):
    class Meta:
        model = User
        fields = ('id', 'first_name',)
class Tag_Type(DjangoObjectType):
    class Meta:
        model = Tag
        fields = '__all__'
class Part_Type(graphene.ObjectType): 
    id = graphene.ID()
    t = graphene.ID()
    def __init__(self, n): self.n=n
    def resolve_id(self, info): return self.n.id
    def resolve_t(self, info): return self.n.t_id
class Atom_Type(graphene.ObjectType):
    id = graphene.ID()
    def resolve_id(self, info): return self.n.id 
class Bool_Type(Atom_Type):
    v = graphene.Boolean()
    def __init__(self, n): self.n=n
    def resolve_v(self, info): return self.n.v 
class Int_Type(Atom_Type):
    v = graphene.Int()
    def __init__(self, n): self.n=n
    def resolve_v(self, info): return self.n.v 
class Float_Type(Atom_Type):
    v = graphene.Float()
    def __init__(self, n): self.n=n
    def resolve_v(self, info): return self.n.v 
class String_Type(Atom_Type):
    v = graphene.String()
    def __init__(self, n): self.n=n
    def resolve_v(self, info): return self.n.v 
class Edge_Type(graphene.ObjectType): 
    r = graphene.ID()
    t = graphene.ID()
    n = graphene.ID()
    def __init__(self, e): self.e = e
    def resolve_r(self, info): return self.e.r_id
    def resolve_t(self, info): return self.e.t_id
    def resolve_n(self, info): return self.e.n_id

class Pack_Type(graphene.ObjectType): 
    t = graphene.List(Tag_Type)
    p = graphene.List(Part_Type)
    b = graphene.List(Bool_Type)
    i = graphene.List(Int_Type)
    f = graphene.List(Float_Type)
    s = graphene.List(String_Type)
    dp = graphene.List(graphene.ID)
    db = graphene.List(graphene.ID)
    di = graphene.List(graphene.ID)
    df = graphene.List(graphene.ID)
    ds = graphene.List(graphene.ID)
    pe = graphene.List(Edge_Type)
    be = graphene.List(Edge_Type)
    ie = graphene.List(Edge_Type)
    fe = graphene.List(Edge_Type)
    se = graphene.List(Edge_Type)
    ue = graphene.List(Edge_Type)
    def __init__(self, p, b, i, f, s, dp=None, db=None, di=None, df=None, ds=None):
        self.p_ids = tuple([n.id for n in p])
        self.p=p
        self.b=b
        self.i=i
        self.f=f
        self.s=s
        self.dp=dp
        self.db=db
        self.di=di
        self.df=df
        self.ds=ds
    def resolve_t(self, info): return Tag.objects.all()
    def resolve_p(self, info): return [Part_Type(n=n) for n in self.p] #[Part_Min_Type(id=pc, t=p['t_id']) for p in self.p.values()]
    def resolve_b(self, info): return [Bool_Type(n=n) for n in self.b]
    def resolve_i(self, info): return [Int_Type(n=n) for n in self.i]
    def resolve_f(self, info): return [Float_Type(n=n) for n in self.f]
    def resolve_s(self, info): return [String_Type(n=n) for n in self.s]
    def resolve_dp(self, info): return [n.id for n in self.dp] #[Part_Min_Type(id=pc, t=p['t_id']) for p in self.p.values()]
    def resolve_db(self, info): return [n.id for n in self.db]
    def resolve_di(self, info): return [n.id for n in self.di]
    def resolve_df(self, info): return [n.id for n in self.df]
    def resolve_ds(self, info): return [n.id for n in self.ds]
    def resolve_pe(self, info): return [Edge_Type(e=e) for e in Part.objects.raw("""
        SELECT * FROM core_part_part WHERE core_part_part.r_id IN %(parts)s OR core_part_part.n_id IN %(parts)s""", 
        {'parts':self.p_ids})]
    def resolve_be(self, info): return [Edge_Type(e=e) for e in Part.objects.raw("""
        SELECT * FROM core_part_bool WHERE core_part_bool.r_id IN %(parts)s OR core_part_bool.n_id IN %(bools)s""", 
        {'parts':self.p_ids, 'bools':tuple([n.id for n in self.b] + ['none'])})]
    def resolve_ie(self, info): return [Edge_Type(e=e) for e in Part.objects.raw("""
        SELECT * FROM core_part_int WHERE core_part_int.r_id IN %(parts)s OR core_part_int.n_id IN %(ints)s""", 
        {'parts':self.p_ids, 'ints':tuple([n.id for n in self.i] + ['none'])})]
    def resolve_fe(self, info): return [Edge_Type(e=e) for e in Part.objects.raw("""
        SELECT * FROM core_part_float WHERE core_part_float.r_id IN %(parts)s OR core_part_float.n_id IN %(floats)s""", 
        {'parts':self.p_ids, 'floats':tuple([n.id for n in self.f] + ['none'])})]
    def resolve_se(self, info): return [Edge_Type(e=e) for e in Part.objects.raw("""
        SELECT * FROM core_part_string WHERE core_part_string.r_id IN %(parts)s OR core_part_string.n_id IN %(strings)s""", 
        {'parts':self.p_ids, 'strings':tuple([n.id for n in self.s] + ['none'])})]
    def resolve_ue(self, info): return [Edge_Type(e=e) for e in Part.objects.raw("""
        SELECT * FROM core_part_user WHERE core_part_user.r_id IN %(parts)s""", 
        {'parts':self.p_ids})]

def clear_part(part):
    part.p.clear()
    part.b.clear()
    part.i.clear()
    part.f.clear()
    part.s.clear()

select_p = ' SELECT n.id, n.t_id FROM core_part n WHERE '
select_b = ' SELECT n.id, n.v FROM core_bool n WHERE '
select_i = ' SELECT n.id, n.v FROM core_int n WHERE '
select_f = ' SELECT n.id, n.v FROM core_float n WHERE '
select_s = ' SELECT n.id, n.v FROM core_string n WHERE '
exists_p = ' EXISTS (SELECT e.id FROM core_part_part e WHERE e.n_id=n.id AND '
exists_b = ' EXISTS (SELECT e.id FROM core_part_bool e WHERE e.n_id=n.id AND '
exists_i = ' EXISTS (SELECT e.id FROM core_part_int e WHERE e.n_id=n.id AND '
exists_f = ' EXISTS (SELECT e.id FROM core_part_float e WHERE e.n_id=n.id AND '
exists_s = ' EXISTS (SELECT e.id FROM core_part_string e WHERE e.n_id=n.id AND '

class Query(graphene.ObjectType):
    user = graphene.Field(Authenticated_User_Type)
    pollPack   = graphene.Field(Pack_Type, instance=graphene.String())
    #deletePack = graphene.Field(Pack_Type, instance=graphene.String())
    def resolve_user(root, info):
        if info.context.user.is_authenticated: return info.context.user
        else: return None
    def resolve_pollPack(root, info, instance): 
        try:
            user = info.context.user
            if user.is_authenticated:
                #String.objects.annotate(parts=Count('p')).filter(parts__lt=1).delete()
                Int.objects.filter(e__t__v='system_time', v__lt=int(time.time())-6).delete() # delete if 4 seconds old! make client pull everything if disconnects for more than 4 seconds
                Part.objects.filter(~Q(ie__t__v='system_time'), t__v='poll_pack').delete()
                #String.objects.filter(~Q(e__t__v='client_instance'), p__in=old_poll_packs).delete() 
                #old_poll_packs.delete()

                #open_pack = Part.objects.get(t__v='open_pack', u=user).id
                #poll_packs = Part.objects.filter(~Q(s__v=instance), t__v='poll_pack')

                op_id = Part.objects.get(t__v='open_pack', u=user).id
                dp_ids = tuple(Part.objects.filter(~Q(s__v=instance), t__v='delete_pack').values_list('id')) or ('',)
                #tuple([pp.id for pp in Part.objects.filter(~Q(s__v=instance), t__v='delete_pack')] + ['none'])

                params = {
                    'op': op_id,
                    'pp': tuple([pp.id for pp in Part.objects.filter(~Q(s__v=instance), t__v='poll_pack')] + ['none']),
                    'opt': tag['open_pack'].id,
                    'dp': dp_ids,
                }

                # skip if pp is none?
                # check if not in delete_pack
                parts = Part.objects.raw(select_p   # need to check if still under profile as asset ?!?!?!?!?!
                    +"n.t_id != 'none' AND "
                    +exists_p+'e.r_id = %(op)s) AND'
                    +exists_p+'e.r_id IN %(pp)s) AND '
                    +'NOT'+exists_p+'e.r_id IN %(dp)s)'
                ,params)
                bools = Bool.objects.raw(select_b
                    +exists_b+'e.r_id = %(op)s) AND'
                    +exists_b+'e.r_id IN %(pp)s) AND '
                    +'NOT'+exists_b+'e.r_id IN %(dp)s)'
                ,params)
                ints = Int.objects.raw(select_i
                    +exists_i+'e.r_id = %(op)s) AND'
                    +exists_i+'e.r_id IN %(pp)s) AND '
                    +'NOT'+exists_i+'e.r_id IN %(dp)s)'
                ,params)
                floats = Float.objects.raw(select_f
                    +exists_f+'e.r_id = %(op)s) AND'
                    +exists_f+'e.r_id IN %(pp)s) AND '
                    +'NOT'+exists_f+'e.r_id IN %(dp)s)'
                ,params)
                strings = String.objects.raw(select_s
                    +exists_s+'e.r_id = %(op)s) AND'
                    +exists_s+'e.r_id IN %(pp)s) AND '
                    +'NOT'+exists_s+'e.r_id IN %(dp)s)'
                ,params)

                old_delete_packs = Part.objects.filter(~Q(ie__t__v='system_time'), t__v='delete_pack')
                Part.objects.filter(r__in=old_delete_packs).delete()
                Bool.objects.filter(p__in=old_delete_packs).delete()
                Int.objects.filter(p__in=old_delete_packs).delete()
                Float.objects.filter(p__in=old_delete_packs).delete()
                String.objects.filter(~Q(e__t__v='client_instance'), p__in=old_delete_packs).delete() #  temp disable so client instance string does not get deleted!!!!
                old_delete_packs.delete()
                params = {
                    'op': op_id,
                    'dp': dp_ids,
                    'dp': dp_ids,
                }
                # skip if dp is none?
                d_parts = Part.objects.raw("""SELECT core_part.id, core_part.t_id FROM core_part WHERE
                    EXISTS (SELECT core_part_part.id FROM core_part_part WHERE core_part_part.n_id=core_part.id AND core_part_part.r_id = %(op)s) AND
                    EXISTS (SELECT core_part_part.id FROM core_part_part WHERE core_part_part.n_id=core_part.id AND core_part_part.r_id IN %(dp)s) 
                """, params)
                d_bools = Bool.objects.raw("""SELECT core_bool.id, core_bool.v FROM core_bool WHERE
                    EXISTS (SELECT core_part_bool.id FROM core_part_bool WHERE core_part_bool.n_id=core_bool.id AND core_part_bool.r_id = %(op)s) AND
                    EXISTS (SELECT core_part_bool.id FROM core_part_bool WHERE core_part_bool.n_id=core_bool.id AND core_part_bool.r_id IN %(dp)s) 
                """, params)
                d_ints = Int.objects.raw("""SELECT core_int.id, core_int.v FROM core_int WHERE
                    EXISTS (SELECT core_part_int.id FROM core_part_int WHERE core_part_int.n_id=core_int.id AND core_part_int.r_id = %(op)s) AND
                    EXISTS (SELECT core_part_int.id FROM core_part_int WHERE core_part_int.n_id=core_int.id AND core_part_int.r_id IN %(dp)s) 
                """, params)
                d_floats = Float.objects.raw("""SELECT core_float.id, core_float.v FROM core_float WHERE
                    EXISTS (SELECT core_part_float.id FROM core_part_float WHERE core_part_float.n_id=core_float.id AND core_part_float.r_id = %(op)s) AND
                    EXISTS (SELECT core_part_float.id FROM core_part_float WHERE core_part_float.n_id=core_float.id AND core_part_float.r_id IN %(dp)s) 
                """, params)
                d_strings = String.objects.raw("""SELECT core_string.id, core_string.v FROM core_string WHERE
                    EXISTS (SELECT core_part_string.id FROM core_part_string WHERE core_part_string.n_id=core_string.id AND core_part_string.r_id = %(op)s) AND
                    EXISTS (SELECT core_part_string.id FROM core_part_string WHERE core_part_string.n_id=core_string.id AND core_part_string.r_id IN %(dp)s) 
                """, params)

                return Pack_Type(p=parts,b=bools,i=ints,f=floats,s=strings, dp=d_parts,db=d_bools,di=d_ints,df=d_floats,ds=d_strings)
            return None
        except Exception as e: 
            print('poll_pack error') 
            print(e)
        return None

# maybe less queries if read tag id instead of tag value?
class Open_Pack(graphene.Mutation):
    class Arguments:
        depth = graphene.Int()
        ids = graphene.List(graphene.ID)
        include = graphene.List(graphene.List(graphene.String)) # must include nodes that use these atoms with these values 
        exclude = graphene.List(graphene.List(graphene.String)) # must exclude nodes that use these atoms with these values
    pack = graphene.Field(Pack_Type)
    reply = graphene.String(default_value = 'Failed to open pack.')
    @classmethod
    def mutate(cls, root, info, depth, ids, include, exclude): # offset, limit for pages
        try:
            user = info.context.user
            params = {
                'cats':     cats,
                'public':  Part.objects.get(t__v='public').id,
                'profile': Part.objects.get(t__v='profile', ue__n=user).id 
                    if user.is_authenticated else 'none',
                'dp': tuple(Part.objects.filter(t__v='delete_pack').values_list('id')) or ('',),#tuple([dp.id for dp in Part.objects.filter(t__v='delete_pack')] + ['none']), # use .values instead of list comp
            }
            parts = Part.objects.raw(select_p # should check if asset tag as well ?!?!?!?!
                +"n.t_id != 'none' AND "
                +exists_p+'(e.r_id = %(profile)s OR e.r_id = %(public)s)) AND '
                +'NOT'+exists_p+'e.r_id IN %(dp)s) '
                +'UNION SELECT core_part.id, core_part.t_id FROM core_part WHERE core_part.id in %(cats)s'
                ,params)
            bools = Bool.objects.raw(select_b
                +exists_b+'(e.r_id = %(profile)s OR e.r_id = %(public)s)) AND '
                +'NOT'+exists_b+'e.r_id IN %(dp)s) '
                ,params)
            ints = Int.objects.raw(select_i
                +exists_i+'(e.r_id = %(profile)s OR e.r_id = %(public)s)) AND '
                +'NOT'+exists_i+'e.r_id IN %(dp)s) '
                ,params)
            floats = Float.objects.raw(select_f
                +exists_f+'(e.r_id = %(profile)s OR e.r_id = %(public)s)) AND '
                +'NOT'+exists_f+'e.r_id IN %(dp)s) '
                , params)
            strings = String.objects.raw(select_s
                +exists_s+'(e.r_id = %(profile)s OR e.r_id = %(public)s)) AND '
                +'NOT'+exists_s+'e.r_id IN %(dp)s) '
                ,params)
            if user.is_authenticated: 
                r_id = Part.objects.get(t__v='open_pack', u=user).id # pu1__n2=user
                t_id = tag['open_pack'].id
                Part_Part.objects.bulk_create([Part_Part(r_id=r_id, n_id=n.id, t_id=t_id) for n in parts], ignore_conflicts=True)
                Part_Bool.objects.bulk_create([Part_Bool(r_id=r_id, n_id=n.id, t_id=t_id) for n in bools], ignore_conflicts=True)
                Part_Int.objects.bulk_create([Part_Int(r_id=r_id, n_id=n.id, t_id=t_id) for n in ints], ignore_conflicts=True)
                Part_Float.objects.bulk_create([Part_Float(r_id=r_id, n_id=n.id, t_id=t_id) for n in floats], ignore_conflicts=True)
                Part_String.objects.bulk_create([Part_String(r_id=r_id, n_id=n.id, t_id=t_id) for n in strings], ignore_conflicts=True)
            return Open_Pack(pack=Pack_Type(p=parts, b=bools, i=ints, f=floats, s=strings), reply='Parts opened.')
        except Exception as e: 
            print('open_pack error')
            print(e)
        return Open_Pack()

class Close_Pack(graphene.Mutation):
    class Arguments:
        p = graphene.List(graphene.ID)
        b = graphene.List(graphene.ID)
        i = graphene.List(graphene.ID)
        f = graphene.List(graphene.ID)
        s = graphene.List(graphene.ID)
    reply = graphene.String(default_value = 'Failed to close pack.')
    @classmethod
    def mutate(cls, root, info, p, b, i, f, s):
        try:
            user = info.context.user
            if user.is_authenticated: 
                open_pack = Part.objects.get(t__v='open_pack', u=user) # pu1__n2=user
                if p:
                    parts   = Part.objects.filter(id__in=p)
                    open_pack.p.remove(*parts) 
                if b:
                    bools   = Bool.objects.filter(id__in=b)
                    open_pack.b.remove(*bools)
                if i:
                    ints    = Int.objects.filter(id__in=i)
                    open_pack.i.remove(*ints)
                if f:
                    floats  = Float.objects.filter(id__in=f)
                    open_pack.f.remove(*floats)
                if s:
                    strings = String.objects.filter(id__in=s)
                    open_pack.s.remove(*strings)
            return Close_Pack(reply='Closed pack.')
        except Exception as e: print(e)
        return Close_Pack()


class Push_Pack(graphene.Mutation):
    class Arguments:
        instance = graphene.String()
        atoms = graphene.List(graphene.List(graphene.ID)) # vids[m][n]
        b = graphene.List(graphene.Boolean)
        i = graphene.List(graphene.Int)
        f = graphene.List(graphene.Float)
        s = graphene.List(graphene.String)
        parts = graphene.List(graphene.List(graphene.List(graphene.ID))) # ids[p][m][n] (first m contains  part id)
        t = graphene.List(graphene.List(graphene.List(graphene.ID))) # t1[p][m][n] (first m containts part tag)
        pdel = graphene.List(graphene.ID)
        bdel = graphene.List(graphene.ID)
        idel = graphene.List(graphene.ID)
        fdel = graphene.List(graphene.ID)
        sdel = graphene.List(graphene.ID)
    reply = graphene.String(default_value = 'Failed to save.')
    @classmethod
    def mutate(cls, root, info, instance, atoms, b, i, f, s, parts, t, pdel,bdel,idel,fdel,sdel): 
        try: # must make sure nodes do not get added to poll_pack if set for delete!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            reply='Saved'
            user = info.context.user
            if user.is_authenticated: 

                # setup:
                profile = Part.objects.get(t__v='profile', ue__n=user)# profile = Part.objects.get(t__v='profile', u=user)   #team = Part.objects.get(t__v='team', pu1__t2__v='owner', u=user) # pu1__n2=user #temp_pack = {p:[], b:[], i:[], f:[], s:[]}
                is_asset = Q(e__t__v='asset', e__r=profile) # pp2__n1__pu1__n2=user
                poll_pack = Part.objects.create(t=tag['poll_pack']) 
                system_time = Int.objects.create(v=int(time.time()))
                poll_pack.i.add(system_time, through_defaults={'t':tag['system_time']})
                if instance:
                    client_instance = String.objects.get_or_create(v=instance)[0]
                    poll_pack.s.add(client_instance, through_defaults={'t':tag['client_instance']}) # o:2 so sender doesn't recieve
                poll_pack.p.add(profile, through_defaults={'t':tag['poll_pack']}) # change so profile is only added if it actually gains or loses assets or something like that
                new_nodes = {'p':[], 'b':[], 'i':[], 'f':[], 's':[]}


                params = {
                    'opens': tuple([p.id for p in Part.objects.filter(t__v='open_pack')] + ['none']), # could be tuple comprehension?
                    'open': Part.objects.get(t__v='open_pack', u=user).id,
                    'profile':    profile.id,
                    'update':     poll_pack.id,
                    'cats':       cats,
                    'perm_tag':   perm_tag, # data.t NOT IN %(perm_tag)s -- make it about anything that could effect meaning/behavior of child node!!!!!?!?!?!?
                    'asset_tag':  tag['asset'].id,
                    'open_tag':   tag['open_pack'].id,
                    'update_tag': tag['poll_pack'].id,
                    'delete_tag': tag['delete_pack'].id,
                    'f_id':   ['none'],
                    'f_v':    [0],
                    's_id':   ['none'],
                    's_v':    ['empty'],
                    'r_id':   ['none'],
                    'r_t_id': ['none'],
                    'p_r_id': ['none'],
                    'p_n_id': ['none'],
                    'p_t_id': ['none'],
                    'f_r_id': ['none'],
                    'f_n_id': ['none'],
                    'f_t_id': ['none'],
                    's_r_id': ['none'],
                    's_n_id': ['none'],
                    's_t_id': ['none'],
                }
                if atoms:
                    if len(atoms[2]) > 0:
                        params['f_id'] += atoms[2]
                        params['f_v'] += f 
                    if len(atoms[3]) > 0:
                        params['s_id'] += atoms[3]
                        params['s_v'] += s 
                if parts:
                    for p in range(len(parts)):
                        params['r_id'].append(parts[p][0][0])
                        params['r_t_id'].append(t[p][0][0])
                        params['p_r_id'] += [parts[p][0][0] for n in parts[p][1]] 
                        params['p_n_id'] += parts[p][1] 
                        params['p_t_id'] += t[p][1]
                        params['f_r_id'] += [parts[p][0][0] for n in parts[p][4]] 
                        params['f_n_id'] += parts[p][4]
                        params['f_t_id'] += t[p][4]
                        params['s_r_id'] += [parts[p][0][0] for n in parts[p][5]] 
                        params['s_n_id'] += parts[p][5]
                        params['s_t_id'] += t[p][5]
                params['r_id_tuple'] = tuple(params['r_id'])
                with connection.cursor() as cursor: 
                    cursor.execute("""
                        -- floats
                        CREATE TEMP TABLE new_float (id TEXT, v DOUBLE PRECISION);
                        WITH data AS (
                            INSERT INTO core_float (id, v) SELECT unnest(%(f_id)s), unnest(%(f_v)s) 
                                ON CONFLICT (id) DO UPDATE SET v = EXCLUDED.v 
                                    WHERE EXISTS (SELECT a.id FROM core_part_float a WHERE a.n_id = core_float.id AND a.r_id = %(profile)s)  
                            RETURNING id, v
                        ) INSERT INTO new_float (id, v) SELECT * FROM data;
                        INSERT INTO core_part_float (r_id, n_id, t_id, o) SELECT %(profile)s, id, %(asset_tag)s, 0 FROM new_float ON CONFLICT DO NOTHING;  
                        INSERT INTO core_part_float (r_id, n_id, t_id, o) SELECT %(update)s, id, %(update_tag)s, 0 FROM new_float ON CONFLICT DO NOTHING;
                        DELETE FROM core_part_float a USING new_float WHERE a.n_id = new_float.id AND a.t_id = %(delete_tag)s;

                        -- strings
                        CREATE TEMP TABLE new_string (id TEXT, v TEXT);
                        WITH data AS (
                            INSERT INTO core_string (id, v) SELECT unnest(%(s_id)s), unnest(%(s_v)s) 
                                ON CONFLICT (id) DO UPDATE SET v = EXCLUDED.v 
                                    WHERE EXISTS (SELECT a.id FROM core_part_string a WHERE a.n_id = core_string.id AND a.r_id = %(profile)s)  
                            RETURNING id, v
                        ) INSERT INTO new_string (id, v) SELECT * FROM data;
                        INSERT INTO core_part_string (r_id, n_id, t_id, o) SELECT %(profile)s, id, %(asset_tag)s, 0 FROM new_string ON CONFLICT DO NOTHING;  
                        INSERT INTO core_part_string (r_id, n_id, t_id, o) SELECT %(update)s, id, %(update_tag)s, 0 FROM new_string ON CONFLICT DO NOTHING;
                        DELETE FROM core_part_string a USING new_string WHERE a.n_id = new_string.id AND a.t_id = %(delete_tag)s;

                        -- parts
                        CREATE TEMP TABLE new_part (id TEXT, t_id TEXT);
                        WITH data AS (
                            INSERT INTO core_part (id, t_id) SELECT unnest(%(r_id)s), unnest(%(r_t_id)s) 
                                ON CONFLICT (id) DO UPDATE SET t_id = EXCLUDED.t_id
                                WHERE EXISTS (SELECT a.id FROM core_part_part a WHERE a.n_id = core_part.id AND a.r_id = %(profile)s)  
                            RETURNING id, t_id
                        ) INSERT INTO new_part (id, t_id) SELECT * FROM data;
                        INSERT INTO core_part_part (r_id, n_id, t_id, o) SELECT %(profile)s, id, %(asset_tag)s, 0 FROM new_part ON CONFLICT DO NOTHING;  
                        INSERT INTO core_part_part (r_id, n_id, t_id, o) SELECT %(update)s, id, %(update_tag)s, 0 FROM new_part ON CONFLICT DO NOTHING;
                        DELETE FROM core_part_part a USING new_part WHERE a.n_id = new_part.id AND a.t_id = %(delete_tag)s;

                        -- clear parts -- must only clear what is open
                        DELETE FROM core_part_part a WHERE a.r_id IN %(r_id_tuple)s 
                            AND ((a.r_id IN %(cats)s AND EXISTS (SELECT a.id FROM core_part_part b WHERE b.n_id = a.n_id AND b.r_id = %(open)s))
                                OR EXISTS (SELECT a.id FROM core_part_part b WHERE b.n_id = a.r_id AND b.r_id = %(profile)s))
                            AND EXISTS (SELECT a.id FROM core_part_part b WHERE b.n_id = a.n_id AND b.r_id = %(profile)s);
                        DELETE FROM core_part_float a WHERE a.r_id IN %(r_id_tuple)s;

                        DELETE FROM core_part_string a WHERE a.r_id IN %(r_id_tuple)s;


                        -- part to part edges
                        WITH data AS (
                            SELECT unnest(%(p_r_id)s) AS r, unnest(%(p_n_id)s) AS n, unnest(%(p_t_id)s) AS t
                        )INSERT INTO core_part_part (r_id, n_id, t_id, o) SELECT data.r, data.n, data.t, 0 FROM data 
                            WHERE (data.r IN %(cats)s OR EXISTS (SELECT a.id FROM core_part_part a WHERE a.n_id = data.r AND a.r_id = %(profile)s))
                            AND (data.t NOT IN %(perm_tag)s OR EXISTS (SELECT a.id FROM core_part_part a WHERE a.n_id = data.n AND a.r_id = %(profile)s)) 
                                ON CONFLICT DO NOTHING;

                        -- float edges
                        WITH data AS (
                            SELECT unnest(%(f_r_id)s) AS r, unnest(%(f_n_id)s) AS n, unnest(%(f_t_id)s) AS t
                        )INSERT INTO core_part_float (r_id, n_id, t_id, o) SELECT data.r, data.n, data.t, 0 FROM data  
                            WHERE EXISTS (SELECT a.id FROM core_part_part a WHERE a.n_id = data.r AND a.r_id = %(profile)s)
                            AND (data.t NOT IN %(perm_tag)s OR EXISTS (SELECT a.id FROM core_part_float a WHERE a.n_id = data.n AND a.r_id = %(profile)s)) 
                                ON CONFLICT DO NOTHING;

                        -- string edges
                        WITH data AS (
                            SELECT unnest(%(s_r_id)s) AS r, unnest(%(s_n_id)s) AS n, unnest(%(s_t_id)s) AS t
                        )INSERT INTO core_part_string (r_id, n_id, t_id, o) SELECT data.r, data.n, data.t, 0 FROM data  
                            WHERE EXISTS (SELECT a.id FROM core_part_part a WHERE a.n_id = data.r AND a.r_id = %(profile)s) 
                            AND (data.t NOT IN %(perm_tag)s OR EXISTS (SELECT a.id FROM core_part_string a WHERE a.n_id = data.n AND a.r_id = %(profile)s)) 
                                ON CONFLICT DO NOTHING;

                        -- add to open packs
                        INSERT INTO core_part_float (r_id, n_id, t_id, o) SELECT a.r_id, new_float.id, %(open_tag)s, 0 
                            FROM core_part_part a JOIN core_part_float b ON a.n_id = b.r_id JOIN new_float ON b.n_id = new_float.id
                                WHERE a.r_id IN %(opens)s ON CONFLICT DO NOTHING;
                        INSERT INTO core_part_string (r_id, n_id, t_id, o) SELECT a.r_id, new_string.id, %(open_tag)s, 0 
                            FROM core_part_part a JOIN core_part_string b ON a.n_id = b.r_id JOIN new_string ON b.n_id = new_string.id
                                WHERE a.r_id IN %(opens)s ON CONFLICT DO NOTHING;
                        INSERT INTO core_part_part (r_id, n_id, t_id, o) SELECT a.r_id, new_part.id, %(open_tag)s, 0 
                            FROM core_part_part a JOIN core_part_part b ON a.n_id = b.r_id JOIN new_part ON b.n_id = new_part.id
                                WHERE a.r_id IN %(opens)s ON CONFLICT DO NOTHING;
                    """, params)


                if pdel or bdel or idel or fdel or sdel:
                    delete_pack = Part.objects.create(t=tag['delete_pack']) 
                    delete_pack.i.add(system_time, through_defaults={'t':tag['system_time']})
                    if instance: delete_pack.s.add(client_instance, through_defaults={'t':tag['client_instance']})
                    if pdel: # must check if every root is an asset too!!! (except public, profile, etc) !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        try: delete_pack.p.add(*Part.objects.filter(is_asset, id__in=pdel), through_defaults={'t':tag['delete_pack']})
                        except Exception as e: print(e)
                    if bdel: # must check if every root is an asset too!!! (except public, profile, etc) !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        try: delete_pack.b.add(*Bool.objects.filter(is_asset, id__in=bdel), through_defaults={'t':tag['delete_pack']})
                        except Exception as e: print(e)
                    if idel: # must check if every root is an asset too!!! (except public, profile, etc) !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        try: delete_pack.i.add(*Int.objects.filter(is_asset, id__in=idel), through_defaults={'t':tag['delete_pack']})
                        except Exception as e: print(e)
                    if fdel: # must check if every root is an asset too!!! (except public, profile, etc) !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        try: delete_pack.f.add(*Float.objects.filter(is_asset, id__in=fdel), through_defaults={'t':tag['delete_pack']})
                        except Exception as e: print(e)
                    if sdel: # must check if every root is an asset too!!! (except public, profile, etc) !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        try: delete_pack.s.add(*String.objects.filter(is_asset, id__in=sdel), through_defaults={'t':tag['delete_pack']})
                        except Exception as e: print(e)
            else: reply = 'Sign-in required.'
            return Push_Pack(reply=reply) 
        except Exception as e: print(e)
        return Push_Pack()


class Login(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
    user = graphene.Field(User_Type)
    reply = graphene.String(default_value = 'Failed to sign in.')
    @classmethod
    def mutate(cls, root, info, username, password):
        user = authenticate(username=username, password=password)
        if user: 
            login(info.context, user)
            return Login(reply='Welcome ' + user.first_name, user=user)
        return Login()
        
class Logout(graphene.Mutation):
    user = graphene.Field(User_Type)
    reply = graphene.String(default_value = 'Failed to sign out.')
    @classmethod
    def mutate(cls, root, info):
        if info.context.user.is_authenticated: 
            user = info.context.user
            logout(info.context)
            return Logout(reply='Farewell '+user.first_name, user=user)
        return Logout()

class Mutation(graphene.ObjectType):
    login = Login.Field()
    logout = Logout.Field()
    openPack = Open_Pack.Field()
    pushPack = Push_Pack.Field()
    closePack = Close_Pack.Field()
    #deletePack = Delete_Pack.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)





# def make_data():
#     try:
#         try:
#             Part.objects.get(t__v='profile')
#         except:
#             Tag.objects.all().delete()
#             Part.objects.all().delete()
#             Bool.objects.all().delete()
#             Int.objects.all().delete()
#             Float.objects.all().delete()
#             String.objects.all().delete()

#             system_tags = ['user', 'profile', 'open_pack', 'poll_pack']
#             tag = {t: Tag.objects.create(v=t, system=(t in system_tags)) for t in [
#                 'user', 'open_pack', 'poll_pack', 'profile', 'public', 'viewable', 'asset', 
#                 'name', 'x', 'y', 'z', 'point', 'line',
#             ]}

#             user1 = User.objects.get(id=1)

#             name0 = String.objects.create(v=user1.first_name) 
#             name1 = String.objects.create(v='Pink')
#             name2 = String.objects.create(v='Orange')
#             x1 = Float.objects.create(v=1.11)
#             y1 = Float.objects.create(v=2.22)
#             z1 = Float.objects.create(v=3.33)
#             x2 = Float.objects.create(v=4.44)
#             y2 = Float.objects.create(v=5.55)
#             z2 = Float.objects.create(v=6.66)

#             point1 = Part.objects.create(t=tag['point'])
#             point1.s.add(name1, through_defaults={'t':tag['name']})
#             point1.f.add(x1, through_defaults={'t':tag['x']})
#             point1.f.add(y1, through_defaults={'t':tag['y']})
#             point1.f.add(z1, through_defaults={'t':tag['z']})
#             point2 = Part.objects.create(t=tag['point'])
#             point2.s.add(name2, through_defaults={'t':tag['name']})
#             point2.f.add(x2, through_defaults={'t':tag['x']})
#             point2.f.add(y2, through_defaults={'t':tag['y']})
#             point2.f.add(z2, through_defaults={'t':tag['z']})

#             public = Part.objects.create(t=tag['public'])
#             public.p.add(point1, through_defaults={'t':tag['viewable']})
#             public.s.add(name0, through_defaults={'t':tag['viewable']})
#             public.s.add(name1, through_defaults={'t':tag['viewable']})
#             public.f.add(x1, through_defaults={'t':tag['viewable']})
#             public.f.add(y1, through_defaults={'t':tag['viewable']})
#             public.f.add(z1, through_defaults={'t':tag['viewable']})

#             poll_pack = Part.objects.create(t=tag['poll_pack']) # don't need to create if cycling poll by create and delete
#             poll_pack.u.add(user1, through_defaults={'t':tag['user']})
#             open_pack = Part.objects.create(t=tag['open_pack'])
#             open_pack.u.add(user1, through_defaults={'t':tag['user']})
#             open_pack.p.add(poll_pack, through_defaults={'t':tag['poll_pack']})

#             profile1 = Part.objects.create(t=tag['profile'])
#             profile1.u.add(user1, through_defaults={'t':tag['user']})
#             profile1.p.add(point2, through_defaults={'t':tag['asset']})
#             profile1.s.add(name0, through_defaults={'t':tag['name']})
#             profile1.s.add(name2, through_defaults={'t':tag['asset']})
#             profile1.f.add(x2, through_defaults={'t':tag['asset']})
#             profile1.f.add(y2, through_defaults={'t':tag['asset']})
#             profile1.f.add(z2, through_defaults={'t':tag['asset']})

#             public.p.add(profile1, through_defaults={'t':tag['viewable']})
#     except Exception as e: print(e)
    
#make_data() 



# WHERE NOT EXISTS (SELECT tag.id FROM core_tag tag WHERE tag.system = TRUE AND tag.id = id)


#restricted = graphene.List(graphene.ID) #graphene.Field(Part_Type)
    # def mod_or_make_atom(profile, model, part_model, m, id, v, new_nodes, poll_pack): # check if m is correct value?
    #     atom = None
    #     try: atom = model.objects.get(id=id, e__t__v='asset', e__r=profile) #model.objects.get(**{'id':id, 'p'+m+'2__t1__v':'editor', 'p'+m+'2__n1__u':user}) #'p'+m+'2__n1__pu1__n2':user
    #     except Exception as e: 
    #         print(e)
    #         try:
    #             atom = model.objects.create(id=id) # should throw error if exists already
    #             getattr(profile, m).add(atom, through_defaults={'t':tag['asset']}) #temp_pack.p.append(team)
    #             new_nodes[m].append(id)
    #         except Exception as e: print(e)
    #     if atom:
    #         atom.v = v
    #         atom.save() #if obj: temp_pack[m].append(obj)#return atom
    #         getattr(poll_pack, m).add(atom, through_defaults={'t':tag['poll_pack']}) # change to 'atom' 
    #         part_model.objects.filter(r__t__v='delete_pack', n=atom).delete()
    #     #else: restricted.append(id)
    # def add_atom(is_asset, part, model, m, id, order, t, poll_pack): # check if m is correct value?
    #     try:
    #         tag_obj = Tag.objects.get(v=t, system=False)
    #         if tag_obj.v in permission_tags: atom = model.objects.get(is_asset, id=id) #model.objects.get(**{'id':id, 'p'+m+'2__t1__v':'editor', 'p'+m+'2__n1__u':user}) #'p'+m+'2__n1__pu1__n2':user
    #         else: atom = model.objects.get(id=id) 
    #         getattr(part, m).add(atom, through_defaults={'o':order, 't':tag_obj}) #temp_pack[m].append(obj)
    #         getattr(poll_pack, m).add(atom, through_defaults={'t':tag['poll_pack']})
    #     except Exception as e: 
    #         print(e)
    #         #restricted.append(id)


#     d_parts = Part.objects.raw("""SELECT core_part.id, core_part.t_id FROM core_part WHERE
                #     EXISTS (SELECT core_part_part.id FROM core_part_part WHERE core_part_part.n_id=core_part.id AND core_part_part.r_id = %(op)s) AND
                #     EXISTS (SELECT core_part_part.id FROM core_part_part WHERE core_part_part.n_id=core_part.id AND core_part_part.r_id IN %(dp)s) 
                # """, params)
                    # for i in range(len(atoms[0])):
                    #     cls.mod_or_make_atom(profile, Bool,   Part_Bool,   'b', atoms[0][i], b[i], new_nodes, poll_pack)#, temp_pack)
                    # for i in range(len(atoms[1])):
                    #     cls.mod_or_make_atom(profile, Int,    Part_Int,    'i', atoms[1][i], i[i], new_nodes, poll_pack)#, temp_pack)
                    # #for i in range(len(atoms[2])):
                    # #    cls.mod_or_make_atom(profile, Float,  Part_Float,  'f', atoms[2][i], f[i], new_nodes, poll_pack)#, temp_pack)
                    # for i in range(len(atoms[3])):
                    #     cls.mod_or_make_atom(profile, String, Part_String, 's', atoms[3][i], s[i], new_nodes, poll_pack)#, temp_pack)



                # if parts: # and len(parts) == len(t)
                #     with connection.cursor() as cursor: 
                #         params['r_id'] = ['none']
                #         params['r_t_id'] = ['none']
                #         params['p_id'] = ['none']
                #         params['p_t_id'] = ['none']
                #         for p in range(len(parts)):
                #             params['r_id'].append(parts[p][0][0])
                #             params['r_t_id'].append(t[p][0][0])
                #             params['p_id'].append(parts[p][1]) 
                #             params['p_t_id'].append(t[p][1]) 
                #         cursor.execute("""
                #             CREATE TEMP TABLE new_part (id TEXT, t_id TEXT);
                #             WITH data AS (
                #                 INSERT INTO core_part (id, t_id) SELECT unnest(%(r_id)s), unnest(%(r_t_id)s) 
                #                     ON CONFLICT (id) DO UPDATE SET t_id = EXCLUDED.t_id
                #                     WHERE EXISTS (SELECT e.id FROM core_part_part e WHERE e.n_id = core_part.id AND e.r_id = %(profile)s)  
                #                 RETURNING id, t_id
                #             ) INSERT INTO new_part (id, t_id) SELECT * FROM data;
                #             INSERT INTO core_part_part (r_id, n_id, t_id, o) SELECT %(profile)s, id, %(asset_tag)s, 0 FROM new_part ON CONFLICT DO NOTHING;  
                #             INSERT INTO core_part_part (r_id, n_id, t_id, o) SELECT %(update)s, id, %(update_tag)s, 0 FROM new_part ON CONFLICT DO NOTHING;
                #             DELETE FROM core_part_part a USING new_part WHERE a.n_id = new_part.id AND a.t_id = %(delete_tag)s;

                #             -- Make part to part edges
                #             WITH data AS (
                #                 SELECT unnest(%(r_id)s) AS r, unnest(unnest(%(p_id)s)) AS n, unnest(unnest(%(p_t_id)s)) AS t
                #             )INSERT INTO core_part_part (r_id, n_id, t_id, o) SELECT data.r, data.n, data.t, 0 
                #                 FROM data JOIN core_part_part a ON a.n_id = data.r  
                #                     WHERE a.r = %(profile)s AND (data.t NOT IN %(permission_tags)s OR
                #                         EXISTS (SELECT data.n FROM data JOIN core_part_part b ON b.n_id = data.n WHERE b.r = %(profile)s)
                #                     ) ON CONFLICT DO NOTHING;
                #         """, params)


                    # make parts if don't exist:
                    # for p in range(len(parts)): # use this loop to build list of parts for next loop
                    #     try: 
                    #         part = Part.objects.create(id=parts[p][0][0], t=tag[t[p][0][0]])
                    #         profile.p.add(part, through_defaults={'t':tag['asset']}) # team.p.add(part, through_defaults={'t1':editor_tag, 't2':editable_tag})       
                    #         new_nodes['p'].append(part.id)
                    #     except Exception as e: print(e)
                    # # mutate parts
                    # for p in range(len(parts)): # need to check if id is in correct format
                    #     try: # could remove this try wrap?
                    #         part = Part.objects.get(is_asset, id=parts[p][0][0]) # is_asset OR this user's profile
                    #         part.t = Tag.objects.get(v=t[p][0][0], system=False)
                    #         part.save()
                    #         clear_part(part) #if parts[p][6][0]=='replace': clear_part(part) 
                    #         poll_pack.p.add(part, through_defaults={'t':tag['poll_pack']})
                    #         Part_Part.objects.filter(r__t__v='delete_pack', n=part).delete() # remove part from delete pack  # ~Q(n__id__in=pdel), 

                    #         # just making edges:
                    #         for o in range(len(parts[p][1])):
                    #             try:
                    #                 tag_obj = Tag.objects.get(v=t[p][1][o], system=False)
                    #                 if tag_obj.v in permission_tags: obj = Part.objects.get(is_asset, id=parts[p][1][o])
                    #                 else: obj = Part.objects.get(id = parts[p][1][o]) 
                    #                 #Part_Part.objects.create(r=part, t=tag_obj, n=obj, o=o) # manually create though item so duplicates are allowed (should always add with different o)
                    #                 part.p.add(obj, through_defaults={'o':o, 't':tag_obj})#temp_pack.p.append(obj)
                    #                 ##########################poll_pack.p.add(obj, through_defaults={'t':tag['poll_pack']})
                    #             except Exception as e:
                    #                 #print('push_pack error: part node block') 
                    #                 print(e)
                    #                 #print(parts[p][1][o])
                    #                 #restricted.append(parts[p][1][o])
                    #         for o in range(len(parts[p][2])):
                    #             cls.add_atom(is_asset, part, Bool,   'b', parts[p][2][o], o, t[p][2][o], poll_pack)
                    #         for o in range(len(parts[p][3])):
                    #             cls.add_atom(is_asset, part, Int,    'i', parts[p][3][o], o, t[p][3][o], poll_pack)
                    #         for o in range(len(parts[p][4])):
                    #             cls.add_atom(is_asset, part, Float,  'f', parts[p][4][o], o, t[p][4][o], poll_pack)
                    #         for o in range(len(parts[p][5])):
                    #             cls.add_atom(is_asset, part, String, 's', parts[p][5][o], o, t[p][5][o], poll_pack)
                    #         #for i in range(len(parts[p][6])): # unknown nodes!!
                    #         #    pass 
                    #     except Exception as e: 
                    #         #print('push_pack error: p in parts block') 
                    #         print(e)
                    #         #print(p)
                    #         #restricted.append(parts[p][0][0])
            
                #### add new_nodes to poll_packs
                # params = {
                #     'op': tuple([p.id for p in Part.objects.filter(t__v='open_pack')] + ['none']),
                #     'opt': tag['open_pack'].id, 
                # }
                # with connection.cursor() as cursor: 
                #     if(len(new_nodes['p']) > 0): # this one must be recursive !!!! ?!?!?!
                #         params['p'] = tuple(new_nodes['p'])
                #         cursor.execute("""INSERT INTO core_part_part (r_id, n_id, t_id, o) SELECT a.r_id, b.n_id, %(opt)s, 0 
                #             FROM core_part_part a JOIN core_part_part b ON a.n_id = b.r_id WHERE a.r_id IN %(op)s AND b.n_id IN %(p)s
                #             ON CONFLICT DO NOTHING""", params)
                #     if(len(new_nodes['b']) > 0):
                #         params['b'] = tuple(new_nodes['b'])
                #         cursor.execute("""INSERT INTO core_part_bool (r_id, n_id, t_id, o) SELECT a.r_id, b.n_id, %(opt)s, 0 
                #             FROM core_part_part a JOIN core_part_bool b ON a.n_id = b.r_id WHERE a.r_id IN %(op)s AND b.n_id IN %(b)s
                #             ON CONFLICT DO NOTHING""", params)
                #     if(len(new_nodes['i']) > 0):
                #         params['i'] = tuple(new_nodes['i'])
                #         cursor.execute("""INSERT INTO core_part_int (r_id, n_id, t_id, o) SELECT a.r_id, b.n_id, %(opt)s, 0 
                #             FROM core_part_part a JOIN core_part_int b ON a.n_id = b.r_id WHERE a.r_id IN %(op)s AND b.n_id IN %(i)s
                #             ON CONFLICT DO NOTHING""", params)
                #     if(len(new_nodes['f']) > 0):
                #         params['f'] = tuple(new_nodes['f'])
                #         cursor.execute("""INSERT INTO core_part_float (r_id, n_id, t_id, o) SELECT a.r_id, b.n_id, %(opt)s, 0 
                #             FROM core_part_part a JOIN core_part_float b ON a.n_id = b.r_id WHERE a.r_id IN %(op)s AND b.n_id IN %(f)s
                #             ON CONFLICT DO NOTHING""", params)
                #     if(len(new_nodes['s']) > 0):
                #         params['s'] = tuple(new_nodes['s'])
                #         cursor.execute("""INSERT INTO core_part_string (r_id, n_id, t_id, o) SELECT a.r_id, b.n_id, %(opt)s, 0 
                #             FROM core_part_part a JOIN core_part_string b ON a.n_id = b.r_id WHERE a.r_id IN %(op)s AND b.n_id IN %(s)s 
                #             ON CONFLICT DO NOTHING""", params)



# -- Make Edges
#                             WITH cte1 AS (
#                                 SELECT unnest(%(r_id)s) AS r, unnest(unnest(%(p_id)s)) AS n, unnest(unnest(%(p_t_id)s)) AS t
#                             ),   cte2 AS (
#                                 SELECT pe.r_id AS rr, cte1.r AS r, cte1.n AS n, cte1.t AS t
#                                 FROM core_part_part pe JOIN cte1 ON pe.n_id = cte1.r
#                             ) INSERT INTO core_part_part (r_id, n_id, t_id, o) SELECT cte2.r, cte2.n, cte2.t, 0 
#                                 FROM cte2 WHERE cte2.rr = %(profile)s AND (cte2.t NOT IN %(permission_tags)s OR EXISTS (
#                                         SELECT cte2.n FROM cte2 WHERE 
#                                     )) ON CONFLICT DO NOTHING;


# -- part to part edges
#                         WITH data AS (
#                             SELECT unnest(%(p_r_id)s) AS r, unnest(%(p_n_id)s) AS n, unnest(%(p_t_id)s) AS t
#                         )INSERT INTO core_part_part (r_id, n_id, t_id, o) SELECT data.r, data.n, data.t, 0 
#                             FROM data JOIN core_part_part a ON a.n_id = data.r  
#                                 WHERE a.r_id = %(profile)s AND (data.t NOT IN %(permission_tags)s OR
#                                     EXISTS (SELECT data.n FROM data JOIN core_part_part b ON b.n_id = data.n WHERE b.r_id = %(profile)s)
#                                 ) ON CONFLICT DO NOTHING;

#                         -- float edges
#                         WITH data AS (
#                             SELECT unnest(%(f_r_id)s) AS r, unnest(%(f_n_id)s) AS n, unnest(%(f_t_id)s) AS t
#                         )INSERT INTO core_part_float (r_id, n_id, t_id, o) SELECT data.r, data.n, data.t, 0 
#                             FROM data JOIN core_part_float a ON a.n_id = data.r  
#                                 WHERE a.r_id = %(profile)s AND (data.t NOT IN %(permission_tags)s OR
#                                     EXISTS (SELECT data.n FROM data JOIN core_part_float b ON b.n_id = data.n WHERE b.r_id = %(profile)s)
#                                 ) ON CONFLICT DO NOTHING;

#                         -- string edges
#                         WITH data AS (
#                             SELECT unnest(%(s_r_id)s) AS r, unnest(%(s_n_id)s) AS n, unnest(%(s_t_id)s) AS t
#                         )INSERT INTO core_part_string (r_id, n_id, t_id, o) SELECT data.r, data.n, data.t, 0 
#                             FROM data JOIN core_part_string a ON a.n_id = data.r  
#                                 WHERE a.r_id = %(profile)s AND (data.t NOT IN %(permission_tags)s OR
#                                     EXISTS (SELECT data.n FROM data JOIN core_part_string b ON b.n_id = data.n WHERE b.r_id = %(profile)s)
#                                 ) ON CONFLICT DO NOTHING;