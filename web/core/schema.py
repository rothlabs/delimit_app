import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth.models import User
from core.models import make_id, Part, Tag, Bool, Int, Float, String
from core.models import Part_Part, Part_Bool, Part_Int, Part_Float, Part_String, Part_User
from core.models import tag
from django.db.models import Q, Count
from django.contrib.auth import authenticate, login, logout
from graphene_file_upload.scalars import Upload
import django.utils
import time

class Authenticated_User_Type(DjangoObjectType):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email',)
class User_Type(DjangoObjectType):
    class Meta:
        model = User
        fields = ('id', 'first_name',)


class Part_Type(DjangoObjectType):
    class Meta:
        model = Part
        fields = '__all__'
class Tag_Type(DjangoObjectType):
    class Meta:
        model = Tag
        fields = '__all__'
class Bool_Type(DjangoObjectType):
    class Meta:
        model = Bool
        fields = '__all__'
class Int_Type(DjangoObjectType):
    class Meta:
        model = Int
        fields = '__all__'
class Float_Type(DjangoObjectType):
    class Meta:
        model = Float
        fields = '__all__'
class String_Type(DjangoObjectType):
    class Meta:
        model = String
        fields = '__all__'

class Part_Part_Type(DjangoObjectType):
    class Meta:
        model = Part_Part
        fields = '__all__'
class Part_Bool_Type(DjangoObjectType):
    class Meta:
        model = Part_Bool
        fields = '__all__'
class Part_Int_Type(DjangoObjectType):
    class Meta:
        model = Part_Int
        fields = '__all__'
class Part_Float_Type(DjangoObjectType):
    class Meta:
        model = Part_Float
        fields = '__all__'
class Part_String_Type(DjangoObjectType):
    class Meta:
        model = Part_String
        fields = '__all__'


class Part_Min_Type(graphene.ObjectType): 
    id = graphene.ID()
    t = graphene.ID()
    def __init__(self, id, t):
        self.id=id
        self.t=t
    def resolve_id(self, info): return self.id
    def resolve_t(self, info): return self.t

class Edge_Type(graphene.ObjectType): 
    #o = graphene.Int()
    r = graphene.ID()
    t = graphene.ID()
    n = graphene.ID()
    def __init__(self, r, t, n):
        #self.o=o
        self.r=r
        self.t=t
        self.n=n
    #def resolve_o(self, info): return self.o
    def resolve_r(self, info): return self.r
    def resolve_t(self, info): return self.t
    def resolve_n(self, info): return self.n

def list_edges(edges):
    return [Edge_Type(r=e['r_id'], t=e['t_id'], n=e['n_id']) for e in edges]

class Pack_Type(graphene.ObjectType): 
    t = graphene.List(Tag_Type)
    p = graphene.List(Part_Min_Type)
    b = graphene.List(Bool_Type)
    i = graphene.List(Int_Type)
    f = graphene.List(Float_Type)
    s = graphene.List(String_Type)
    pe = graphene.List(Edge_Type)
    be = graphene.List(Edge_Type)
    ie = graphene.List(Edge_Type)
    fe = graphene.List(Edge_Type)
    se = graphene.List(Edge_Type)
    ue = graphene.List(Edge_Type)
    def __init__(self, p, b, i, f, s):
        self.p=p
        self.b=b
        self.i=i
        self.f=f
        self.s=s
    def resolve_t(self, info): return Tag.objects.all()
    def resolve_p(self, info): return [Part_Min_Type(id=p['id'], t=p['t_id']) for p in self.p.values()]
    def resolve_b(self, info): return self.b.all()
    def resolve_i(self, info): return self.i.all()
    def resolve_f(self, info): return self.f.all()
    def resolve_s(self, info): return self.s.all()
    def resolve_pe(self, info):
        edges = Part_Part.objects.filter(Q(r__in=self.p) | Q(n__in=self.p)).values()
        return list_edges(edges)
    def resolve_be(self, info):
        edges = Part_Bool.objects.filter(Q(r__in=self.p) | Q(n__in=self.b)).values() # could it be n__id for all of these?
        return list_edges(edges)
    def resolve_ie(self, info):
        edges = Part_Int.objects.filter(Q(r__in=self.p) | Q(n__in=self.i)).values()
        return list_edges(edges)
    def resolve_fe(self, info):
        edges = Part_Float.objects.filter(Q(r__in=self.p) | Q(n__in=self.f)).values()
        return list_edges(edges)
    def resolve_se(self, info):
        edges = Part_String.objects.filter(Q(r__in=self.p) | Q(n__in=self.s)).values()
        return list_edges(edges)
    def resolve_ue(self, info):
        edges = Part_User.objects.filter(r__in=self.p).values()
        return list_edges(edges)

def clear_part(part):
    part.p.clear()
    part.b.clear()
    part.i.clear()
    part.f.clear()
    part.s.clear()

class Query(graphene.ObjectType):
    user = graphene.Field(Authenticated_User_Type)
    pollPack   = graphene.Field(Pack_Type, instance=graphene.String())
    deletePack = graphene.Field(Pack_Type, instance=graphene.String())
    def resolve_user(root, info):
        if info.context.user.is_authenticated: return info.context.user
        else: return None
    def resolve_pollPack(root, info, instance): 
        try:
            user = info.context.user
            if user.is_authenticated:
                Int.objects.filter(e__t__v='system_time', v__lt=int(time.time())-6).delete() # delete if 4 seconds old! make client pull everything if disconnects for more than 4 seconds
                Part.objects.filter(~Q(ie__t__v='system_time'), t__v='poll_pack').delete()
                String.objects.annotate(parts=Count('p')).filter(parts__lt=1).delete()
                open_pack = Part.objects.get(t__v='open_pack', u=user)
                # poll_packs = Part.objects.filter(~Q(s__v=instance), t__v='poll_pack')
                # poll_packs = Part.objects.annotate(
                # instances=Count('s',filter=Q(s__v=instance))).filter(~Q(instances__gt=1), t__v='poll_pack')
                #poll_packs = Part.objects.filter(~Q(se__n__v=instance, se__o__gt=1), t__v='poll_pack')
                poll_packs = Part.objects.filter(~Q(s__v=instance), t__v='poll_pack')
                #author_instance = String.objects.
                #poll_packs = Part.objects.filter(t__v='poll_pack')#.filter(se__o__lt=2)
                # delete_packs = Part.objects.filter(t__v='delete_pack')  .filter(~Q(r__in=delete_packs))
                parts   = Part.objects.filter(r__in=poll_packs).distinct() # make this the behavior of shallow_pack
                bools   = Bool.objects.filter(p__in=poll_packs).distinct()
                ints    = Int.objects.filter(p__in=poll_packs).distinct()
                floats  = Float.objects.filter(p__in=poll_packs).distinct()
                strings = String.objects.filter(p__in=poll_packs).distinct()
                open_pack.p.add(*parts.filter(r__r=open_pack), through_defaults={'t':tag['open_pack']}) # make shallow pack skip this
                open_pack.b.add(*bools.filter(p__r=open_pack), through_defaults={'t':tag['open_pack']}) # this is a mutation inside query (bad)
                open_pack.i.add(*ints.filter(p__r=open_pack), through_defaults={'t':tag['open_pack']})
                open_pack.f.add(*floats.filter(p__r=open_pack), through_defaults={'t':tag['open_pack']})
                open_pack.s.add(*strings.filter(p__r=open_pack), through_defaults={'t':tag['open_pack']})
                parts   = parts.filter(r=open_pack)#parts   = parts.filter(Q(r=open_pack) | Q(r__r=open_pack))
                bools   = bools.filter(p=open_pack)
                ints    = ints.filter(p=open_pack)
                floats  = floats.filter(p=open_pack)
                strings = strings.filter(p=open_pack)
                #print('pollPack!!')
                #print(parts.all())

                # for pack in poll_packs:
                #     client_instance = String.objects.get_or_create(v=instance)[0]
                #     pack.s.add(client_instance, through_defaults={'o':0,'t':tag['client_instance']})
                #     se = pack.se.get(n__v=instance)
                #     se.o += 1
                #     se.save()  

                pack = Pack_Type(p=parts, b=bools, i=ints, f=floats, s=strings)
                #print('poll pack') 
                #print(pack)        
                return pack
            return None
        except Exception as e: 
            print('poll_pack error') 
            print(e)
        return None
    def resolve_deletePack(root, info, instance):  
        try:
            user = info.context.user
            if user.is_authenticated:
                old_delete_packs = Part.objects.filter(~Q(ie__t__v='system_time'), t__v='delete_pack')
                Part.objects.filter(r__in=old_delete_packs).delete()
                Bool.objects.filter(p__in=old_delete_packs).delete()
                Int.objects.filter(p__in=old_delete_packs).delete()
                Float.objects.filter(p__in=old_delete_packs).delete()
                String.objects.filter(p__in=old_delete_packs).delete()
                old_delete_packs.delete()
                open_pack = Part.objects.get(t__v='open_pack', u=user) 
                #delete_packs = Part.objects.filter(~Q(se__n__v=instance, se__o__gt=1), t__v='delete_pack') #delete_packs = Part.objects.filter(~Q(s__v=instance), t__v='delete_pack')
                delete_packs = Part.objects.filter(~Q(s__v=instance), t__v='delete_pack') 
                parts   = Part.objects.filter(r=open_pack).filter(r__in=delete_packs).distinct()
                bools   = Bool.objects.filter(p=open_pack).filter(p__in=delete_packs).distinct()
                ints    = Int.objects.filter(p=open_pack).filter(p__in=delete_packs).distinct()
                floats  = Float.objects.filter(p=open_pack).filter(p__in=delete_packs).distinct()
                strings = String.objects.filter(p=open_pack).filter(p__in=delete_packs).distinct()
                # for pack in delete_packs:
                #     client_instance = String.objects.get_or_create(v=instance)[0]
                #     pack.s.add(client_instance, through_defaults={'o':0,'t':tag['client_instance']})
                #     se = pack.se.get(n__v=instance)
                #     se.o += 1
                #     se.save()    
                return Pack_Type(p=parts, b=bools, i=ints, f=floats, s=strings) # must switch to pack type
            return None
        except Exception as e: print(e)
        return None

# class Cycle_Poll(graphene.Mutation): # change so it clears and cycles order instead of deleting and creating?
#     reply = graphene.String(default_value = 'Failed to clear poll.')
#     @classmethod
#     def mutate(cls, root, info):
#         try:
#             user = info.context.user
#             if user.is_authenticated: 
#                 Part.objects.filter(e__t__v='poll_pack', e__o__gt=2, u=user).delete() # number of poll_packs determines number of devices on same account that will recieve updates properly
#                 edges = Part_Part.objects.filter(n__t__v='poll_pack', r__u=user)
#                 for edge in edges:
#                     edge.o += 1
#                     edge.save()
#                 new_pp = Part.objects.create(t=tag['poll_pack'])
#                 new_pp.u.add(user, through_defaults={'t':tag['user']})
#                 op = Part.objects.get(t=tag['open_pack'], u=user)
#                 op.p.add(new_pp, through_defaults={'t':tag['poll_pack']})
#             return Cycle_Poll(reply='Cleared Poll.')
#         except Exception as e: print(e)
#         return Cycle_Poll()

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
        #print('got request for open pack!!!')
        #print(time.time())
        try:
            # get context
            user = info.context.user
            # filter by ids:
            parts = None
            if ids: parts = Part.objects.filter(id__in=ids)
            # filter by public and viewable (excluding deleted):
            if user.is_authenticated: viewable = Q(r__t__v='profile', r__u=user) | Q(t__v='profile', u=user)
            else: viewable = Q(pk__in=[]) # always false
            permission =  (Q(r__t__v='public') | Q(t__v='public') | viewable)
            if parts: parts = parts.filter(permission)#.distinct()
            else: parts = Part.objects.filter(permission)#.distinct()
            # filter out deleted
            delete_packs = Part.objects.filter(t__v='delete_pack')
            parts = parts.filter(~Q(r__in=delete_packs))
            # filter by include and exclude props:
            if include:
                for prop in include:
                    if prop[0]=='b': parts = parts.filter(pe__t__v=prop[1], n__v=prop[2]=='true')#.distinct() # is it higher or lower case?
                    if prop[0]=='i': parts = parts.filter(ie__t__v=prop[1], n__v=int(prop[2]))#.distinct()
                    if prop[0]=='f': parts = parts.filter(fe__t__v=prop[1], n__v=float(prop[2]))#.distinct()
                    if prop[0]=='s': parts = parts.filter(se__t__v=prop[1], n__v=prop[2])#.distinct()
            if exclude:
                for prop in exclude:
                    if prop[0]=='b': parts = parts.filter(~Q(pe__t__v=prop[1], n__v=prop[2]=='true'))#.distinct() # is it higher or lower case?
                    if prop[0]=='i': parts = parts.filter(~Q(ie__t__v=prop[1], n__v=int(prop[2])))#.distinct()
                    if prop[0]=='f': parts = parts.filter(~Q(fe__t__v=prop[1], n__v=float(prop[2])))#.distinct()
                    if prop[0]=='s': parts = parts.filter(~Q(se__t__v=prop[1], n__v=prop[2]))#.distinct()
            # get dependencies filtered by public and viewable
            part_count = len(parts.all())
            while depth is None or depth > 0:  # replace with Part.objects.raw(recursive sql)!!!!
                parts = Part.objects.filter(Q(r__in=parts) | Q(id__in=parts.values_list('id', flat=True)), permission)
                parts = parts.filter(~Q(r__in=delete_packs))#.distinct()
                if(len(parts.all()) > part_count): 
                   part_count = len(parts.all())
                   if depth: depth -= 1
                else: break
            # get atoms:
            if user.is_authenticated: 
                profile = Part.objects.get(t__v='profile', u=user)
                viewable = Q(Q(e__t__v='asset') | Q(e__t__v='view'), e__r=profile)
            else: viewable = Q(pk__in=[])
            permission = Q(e__r__t__v='public') | viewable
            bools   = Bool.objects.filter(permission, p__in=parts)#.distinct()#.filter(Q(pb2__t1__v='public') | Q(Q(pb2__t1__v='viewer') | Q(pb2__t1__v='editor'), pb2__n1__u=user)) 
            ints    = Int.objects.filter(permission, p__in=parts)#.distinct()#.filter(Q(pi2__t1__v='public') | Q(Q(pi2__t1__v='viewer') | Q(pi2__t1__v='editor'), pi2__n1__u=user))
            floats  = Float.objects.filter(permission, p__in=parts)#.distinct() # might not need distinct
            strings = String.objects.filter(permission, p__in=parts)#.distinct()#.filter(Q(ps2__t1__v='public') | Q(Q(ps2__t1__v='viewer') | Q(ps2__t1__v='editor'), ps2__n1__u=user))
            bools = bools.filter(~Q(p__in=delete_packs))
            ints = ints.filter(~Q(p__in=delete_packs))
            floats = floats.filter(~Q(p__in=delete_packs))
            strings = strings.filter(~Q(p__in=delete_packs))
            # add to open_pack
            if user.is_authenticated: 
                open_pack = Part.objects.get(t__v='open_pack', u=user) # pu1__n2=user
                open_pack.p.add(*parts, through_defaults={'t':tag['open_pack']}) #.set(open_pack.p.union(parts), through_defaults={'t1':open_pack_tag})
                open_pack.b.add(*bools, through_defaults={'t':tag['open_pack']})
                open_pack.i.add(*ints, through_defaults={'t':tag['open_pack']})
                open_pack.f.add(*floats, through_defaults={'t':tag['open_pack']})
                open_pack.s.add(*strings, through_defaults={'t':tag['open_pack']})
            # return pack:
            #print('sending open pack!!!')
            #print(time.time())
            return Open_Pack(pack=Pack_Type(p=parts.distinct(), b=bools.distinct(), i=ints.distinct(), f=floats.distinct(), s=strings.distinct()), reply='Parts opened.')
        except Exception as e: print(e)
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

permission_tags = ['public', 'view', 'asset',] 
class Push_Pack(graphene.Mutation):
    class Arguments:
        instance = graphene.String()
        atoms = graphene.List(graphene.List(graphene.ID)) # vids[m][n]
        b = graphene.List(graphene.Boolean)
        i = graphene.List(graphene.Int)
        f = graphene.List(graphene.Float)
        s = graphene.List(graphene.String)
        parts = graphene.List(graphene.List(graphene.List(graphene.ID))) # ids[p][m][n] (first m contains  part id)
        t = graphene.List(graphene.List(graphene.List(graphene.String))) # t1[p][m][n] (first m containts part tag)
        pdel = graphene.List(graphene.ID)
        bdel = graphene.List(graphene.ID)
        idel = graphene.List(graphene.ID)
        fdel = graphene.List(graphene.ID)
        sdel = graphene.List(graphene.ID)
    reply = graphene.String(default_value = 'Failed to save.')
    restricted = graphene.List(graphene.ID) #graphene.Field(Part_Type)
    def mod_or_make_atom(profile, model, part_model, m, id, v, restricted, poll_pack): # check if m is correct value?
        atom = None
        try: atom = model.objects.get(id=id, e__t__v='asset', e__r=profile) #model.objects.get(**{'id':id, 'p'+m+'2__t1__v':'editor', 'p'+m+'2__n1__u':user}) #'p'+m+'2__n1__pu1__n2':user
        except Exception as e: 
            print(e)
            try: 
                atom = model.objects.create(id=id) # should throw error if exists already
                getattr(profile, m).add(atom, through_defaults={'t':tag['asset']}) #temp_pack.p.append(team)
            except Exception as e: print(e)
        if atom:
            atom.v = v
            atom.save() #if obj: temp_pack[m].append(obj)#return atom
            getattr(poll_pack, m).add(atom, through_defaults={'t':tag['poll_pack']}) # change to 'atom' 
            part_model.objects.filter(r__t__v='delete_pack', n=atom).delete()
        else: restricted.append(id)
    def add_atom(is_asset, part, model, m, id, order, t, restricted, poll_pack): # check if m is correct value?
        try:
            tag_obj = Tag.objects.get(v=t, system=False)
            if tag_obj.v in permission_tags: atom = model.objects.get(is_asset, id=id) #model.objects.get(**{'id':id, 'p'+m+'2__t1__v':'editor', 'p'+m+'2__n1__u':user}) #'p'+m+'2__n1__pu1__n2':user
            else: atom = model.objects.get(id=id) 
            getattr(part, m).add(atom, through_defaults={'o':order, 't':tag_obj}) #temp_pack[m].append(obj)
            getattr(poll_pack, m).add(atom, through_defaults={'t':tag['poll_pack']})
        except Exception as e: 
            print(e)
            restricted.append(id)
    @classmethod
    def mutate(cls, root, info, instance, atoms, b, i, f, s, parts, t, pdel,bdel,idel,fdel,sdel): 
        try: # must make sure nodes do not get added to poll_pack if set for delete!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            reply='Saved'
            user = info.context.user
            if user.is_authenticated: 
                profile = Part.objects.get(t__v='profile', u=user)  #team = Part.objects.get(t__v='team', pu1__t2__v='owner', u=user) # pu1__n2=user #temp_pack = {p:[], b:[], i:[], f:[], s:[]}
                is_asset = Q(e__t__v='asset', e__r=profile) # pp2__n1__pu1__n2=user
                poll_pack = Part.objects.create(t=tag['poll_pack']) 
                system_time = Int.objects.create(v=int(time.time()))
                poll_pack.i.add(system_time, through_defaults={'t':tag['system_time']})
                if instance:
                    client_instance = String.objects.get_or_create(v=instance)[0]
                    poll_pack.s.add(client_instance, through_defaults={'t':tag['client_instance']}) # o:2 so sender doesn't recieve
                poll_pack.p.add(profile, through_defaults={'t':tag['poll_pack']}) # change so profile is only added if it actually gains or loses assets or something like that
                #print('instance!!!')
                #print(instance)
                restricted = []#{p:[], b:[], i:[], f:[], s:[]}
                if atoms:
                    # mutate atoms: 
                    for i in range(len(atoms[0])):
                        cls.mod_or_make_atom(profile, Bool,   Part_Bool,   'b', atoms[0][i], b[i], restricted, poll_pack)#, temp_pack)
                    for i in range(len(atoms[1])):
                        cls.mod_or_make_atom(profile, Int,    Part_Int,    'i', atoms[1][i], i[i], restricted, poll_pack)#, temp_pack)
                    for i in range(len(atoms[2])):
                        cls.mod_or_make_atom(profile, Float,  Part_Float,  'f', atoms[2][i], f[i], restricted, poll_pack)#, temp_pack)
                    for i in range(len(atoms[3])):
                        cls.mod_or_make_atom(profile, String, Part_String, 's', atoms[3][i], s[i], restricted, poll_pack)#, temp_pack)
                if parts: # and len(parts) == len(t)
                    # make parts if don't exist:
                    for p in range(len(parts)): # use this loop to build list of parts for next loop
                        try: 
                            part = Part.objects.create(id=parts[p][0][0], t=tag[t[p][0][0]])
                            profile.p.add(part, through_defaults={'t':tag['asset']}) # team.p.add(part, through_defaults={'t1':editor_tag, 't2':editable_tag})       
                        except Exception as e: print(e)
                    # mutate parts
                    for p in range(len(parts)): # need to check if id is in correct format
                        try: # could remove this try wrap?
                            part = Part.objects.get(is_asset, id=parts[p][0][0]) # is_asset OR this user's profile
                            part.t = Tag.objects.get(v=t[p][0][0], system=False)
                            part.save()
                            if parts[p][6][0]=='replace': clear_part(part) 
                            poll_pack.p.add(part, through_defaults={'t':tag['poll_pack']})
                            Part_Part.objects.filter(r__t__v='delete_pack', n=part).delete() # remove part from delete pack  # ~Q(n__id__in=pdel), 
                            for o in range(len(parts[p][1])):
                                try:
                                    tag_obj = Tag.objects.get(v=t[p][1][o], system=False)
                                    if tag_obj.v in permission_tags: obj = Part.objects.get(is_asset, id=parts[p][1][o])
                                    else: obj = Part.objects.get(id = parts[p][1][o]) 
                                    part.p.add(obj, through_defaults={'o':o, 't':tag_obj})#temp_pack.p.append(obj)
                                    ##########################poll_pack.p.add(obj, through_defaults={'t':tag['poll_pack']})
                                except Exception as e:
                                    #print('push_pack error: part node block') 
                                    print(e)
                                    #print(parts[p][1][o])
                                    restricted.append(parts[p][1][o])
                            for o in range(len(parts[p][2])):
                                cls.add_atom(is_asset, part, Bool,   'b', parts[p][2][o], o, t[p][2][o], restricted, poll_pack)
                            for o in range(len(parts[p][3])):
                                cls.add_atom(is_asset, part, Int,    'i', parts[p][3][o], o, t[p][3][o], restricted, poll_pack)
                            for o in range(len(parts[p][4])):
                                cls.add_atom(is_asset, part, Float,  'f', parts[p][4][o], o, t[p][4][o], restricted, poll_pack)
                            for o in range(len(parts[p][5])):
                                cls.add_atom(is_asset, part, String, 's', parts[p][5][o], o, t[p][5][o], restricted, poll_pack)
                            #for i in range(len(parts[p][6])): # unknown nodes!!
                            #    pass 
                            poll_pack.p.add(part, through_defaults={'t':tag['poll_pack']})
                        except Exception as e: 
                            #print('push_pack error: p in parts block') 
                            print(e)
                            #print(p)
                            restricted.append(parts[p][0][0])
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
            return Push_Pack(reply=reply, restricted=restricted) #restricted=Part_Type(p=r.p, b=r.b, i=r.i, f=r.f, s=r.s)
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





def make_data():
    try:
        try:
            Part.objects.get(t__v='profile')
        except:
            Tag.objects.all().delete()
            Part.objects.all().delete()
            Bool.objects.all().delete()
            Int.objects.all().delete()
            Float.objects.all().delete()
            String.objects.all().delete()

            system_tags = ['user', 'profile', 'open_pack', 'poll_pack']
            tag = {t: Tag.objects.create(v=t, system=(t in system_tags)) for t in [
                'user', 'open_pack', 'poll_pack', 'profile', 'public', 'view', 'asset', 
                'name', 'x', 'y', 'z', 'point', 'line',
            ]}

            user1 = User.objects.get(id=1)

            name0 = String.objects.create(v=user1.first_name) 
            name1 = String.objects.create(v='Pink')
            name2 = String.objects.create(v='Orange')
            x1 = Float.objects.create(v=1.11)
            y1 = Float.objects.create(v=2.22)
            z1 = Float.objects.create(v=3.33)
            x2 = Float.objects.create(v=4.44)
            y2 = Float.objects.create(v=5.55)
            z2 = Float.objects.create(v=6.66)

            point1 = Part.objects.create(t=tag['point'])
            point1.s.add(name1, through_defaults={'t':tag['name']})
            point1.f.add(x1, through_defaults={'t':tag['x']})
            point1.f.add(y1, through_defaults={'t':tag['y']})
            point1.f.add(z1, through_defaults={'t':tag['z']})
            point2 = Part.objects.create(t=tag['point'])
            point2.s.add(name2, through_defaults={'t':tag['name']})
            point2.f.add(x2, through_defaults={'t':tag['x']})
            point2.f.add(y2, through_defaults={'t':tag['y']})
            point2.f.add(z2, through_defaults={'t':tag['z']})

            public = Part.objects.create(t=tag['public'])
            public.p.add(point1, through_defaults={'t':tag['view']})
            public.s.add(name0, through_defaults={'t':tag['view']})
            public.s.add(name1, through_defaults={'t':tag['view']})
            public.f.add(x1, through_defaults={'t':tag['view']})
            public.f.add(y1, through_defaults={'t':tag['view']})
            public.f.add(z1, through_defaults={'t':tag['view']})

            poll_pack = Part.objects.create(t=tag['poll_pack']) # don't need to create if cycling poll by create and delete
            poll_pack.u.add(user1, through_defaults={'t':tag['user']})
            open_pack = Part.objects.create(t=tag['open_pack'])
            open_pack.u.add(user1, through_defaults={'t':tag['user']})
            open_pack.p.add(poll_pack, through_defaults={'t':tag['poll_pack']})

            profile1 = Part.objects.create(t=tag['profile'])
            profile1.u.add(user1, through_defaults={'t':tag['user']})
            profile1.p.add(point2, through_defaults={'t':tag['asset']})
            profile1.s.add(name0, through_defaults={'t':tag['name']})
            profile1.s.add(name2, through_defaults={'t':tag['asset']})
            profile1.f.add(x2, through_defaults={'t':tag['asset']})
            profile1.f.add(y2, through_defaults={'t':tag['asset']})
            profile1.f.add(z2, through_defaults={'t':tag['asset']})

            public.p.add(profile1, through_defaults={'t':tag['view']})
    except Exception as e: print(e)
    
#make_data() 







#####def resolve_fe(root, info):
        ######return info.context.pf_by_r_loader.load(root.id)
    #p = graphene.List(lambda: Part_Type)
    #def resolve_p(root, info):
    #    print(list(root.p.values_list('id', flat=True)))
    #    return root.p
    #####def resolve_e(root, info): # , **kwargs
        ######return info.context.pp_by_n_loader.load(root.id)
        #print(root.e.all())
    # def resolve_p(root, info): # , **kwargs
    #          #print(list(root.p.values_list('id', flat=True)))
    #     if root.id: 
    #         print('root id!!!')
    #         return info.context.parts_by_parts_loader.load(root.id)
    #     return root.p.all()
        #try:
        #parts = await info.context.parts_by_parts_loader.load_many(list(root.p.values_list('id', flat=True)))
        #return info.context.parts_by_parts_loader.load(root.id)#load_many(list(root.p.values_list('id', flat=True)))
        #except:
        #    return root.p



# for pp in poll_packs:
                #     client_instance = String.objects.get_or_create(v=instance)[0]
                #     pp.s.add(client_instance, through_defaults={'t':tag['client_instance']})

# class Delete_Pack(graphene.Mutation):
#     class Arguments:
#         pdel = graphene.List(graphene.ID)
#         bdel = graphene.List(graphene.ID)
#         idel = graphene.List(graphene.ID)
#         fdel = graphene.List(graphene.ID)
#         sdel = graphene.List(graphene.ID)
#     reply = graphene.String(default_value = 'Failed to delete.')
#     @classmethod
#     def mutate(cls, root, info, instance, pdel,bdel,idel,fdel,sdel): 
#         try:
#             reply='Deleted'
#             user = info.context.user
#             if user.is_authenticated: 
#                 profile = Part.objects.get(t__v='profile', u=user)  
#                 is_asset = Q(e__t__v='asset', e__r=profile) 
#                 if pdel or bdel or idel or fdel or sdel:
#                     delete_pack = Part.objects.create(t=tag['delete_pack']) 
#                     system_time = Int.objects.create(v=int(time.time()))
#                     delete_pack.i.add(system_time, through_defaults={'t':tag['system_time']})
#                     if instance:
#                         client_instance = String.objects.get_or_create(v=instance)[0] 
#                         delete_pack.s.add(client_instance, through_defaults={'t':tag['client_instance']})
#                     if pdel:
#                         try: delete_pack.p.add(*Part.objects.filter(is_asset, id__in=pdel), through_defaults={'t':tag['delete_pack']})
#                         except Exception as e: print(e)
#                     if bdel:
#                         try: delete_pack.b.add(*Bool.objects.filter(is_asset, id__in=bdel), through_defaults={'t':tag['delete_pack']})
#                         except Exception as e: print(e)
#                     if idel:
#                         try: delete_pack.i.add(*Int.objects.filter(is_asset, id__in=idel), through_defaults={'t':tag['delete_pack']})
#                         except Exception as e: print(e)
#                     if fdel:
#                         try: delete_pack.f.add(*Float.objects.filter(is_asset, id__in=fdel), through_defaults={'t':tag['delete_pack']})
#                         except Exception as e: print(e)
#                     if sdel:
#                         try: delete_pack.s.add(*String.objects.filter(is_asset, id__in=sdel), through_defaults={'t':tag['delete_pack']})
#                         except Exception as e: print(e)
#             else: reply = 'Sign-in required.'
#             return Delete_Pack(reply=reply) 
#         except Exception as e: print(e)
#         return Delete_Pack()



                    #if pdel:
                        # try: 
                        #     parts = Part.objects.filter(is_asset, id__in=pdel)
                        #     deletes = list(parts.values_list("id", flat=True))
                        #     parts.delete()
                        #     for d in deletes:
                        #         deleted = String.objects.get_or_create(v=d)[0]
                        #         delete_pack.s.add(deleted, through_defaults={'t':tag['delete_pack']})
                        # except Exception as e: print(e)


# poll_packs = Part.objects.filter(e__t__v='poll_pack', u=user)
#                 parts   = Part.objects.filter(r__in=poll_packs).distinct()
#                 bools   = Bool.objects.filter(p__in=poll_packs).distinct()
#                 ints    = Int.objects.filter(p__in=poll_packs).distinct()
#                 floats  = Float.objects.filter(p__in=poll_packs).distinct()
#                 strings = String.objects.filter(p__in=poll_packs).distinct()



#clear_part(Part.objects.get(t__v='poll_pack', u=user))
# for pp in poll_packs: clear_part(pp)
                    # edges = Part_Part.objects.filter(n__t__v='poll_pack', o__gt=2, r__u=user)
                    # for edge in edges:
                    #     edge.o = 0
                    #     edge.save()
                #except Exception as e: print(e)


                        #try: Part.objects.get(id=parts[p][0][0], is_asset)
                        #except Exception as e: 
                            #print(e)

# add to poll packs:
                #for p in temp_pack.p: # do this for b, i, f, s as well
                #    poll_packs = Part.objects.filter(t__V='poll_pack', pp2__t1__v='open_pack', pp2__n1__p = p)
                #    for poll_pack in poll_packs: poll_pack.p.add(p, through_defaults={'t1':poll_pack_tag})



# if depth is None: depth = -1
#             current_parts = parts.all()
#             while depth > 0 or depth < 0:  # replace with Part.objects.raw(recursive sql)!!!!
#                 next_parts = Part.objects.none()
#                 for p in current_parts: 
#                     next_parts = next_parts.union(p.p.filter(public | viewable).distinct()) 
#                 if len(next_parts.all()) > 0 and len(next_parts.difference(parts).all()) > 0:
#                     parts = parts.union(next_parts)
#                     current_parts = next_parts.all()
#                     depth -= 1
#                 else: break



# bools   = list(itertools.chain(*[p.b.all() for p in parts])) #Bool.objects.none()
#             ints    = list(itertools.chain(*[p.i.all() for p in parts])) #Int.objects.none()
#             floats  = list(itertools.chain(*[p.f.all() for p in parts])) #Float.objects.none()
#             strings = list(itertools.chain(*[p.s.all() for p in parts])) #String.objects.none()

# make pack:
            # time_int = Int.objects.create(v=int(time.time()))
            # pack = Part.objects.create(t=trash_tag) 
            # pack.u.add(user, through_defaults={'t1':trash_tag, 't2':user_tag})
            # pack.i.add(*ints, through_defaults={'t1':trash_tag})
            # pack.i.add(time_int, through_defaults={'t1':trash_tag, 't2':trash_time_tag})
            # pack.p.add(*parts, through_defaults={'t1':trash_tag})
            # pack.b.add(*bools, through_defaults={'t1':trash_tag})
            # pack.f.add(*floats, through_defaults={'t1':trash_tag})
            # pack.s.add(*strings, through_defaults={'t1':trash_tag})
            # add to opened pack (filter out objects without view permission?)


#temp_pack = Part.objects.create(t=trash_tag)
                #time_int = Int.objects.create(v=int(time.time()))
                #temp_pack.i.add(time_int, through_defaults={'t1':trash_tag,'t2':trash_time_tag})


# clear trash that is older than 10 seconds
            #Int.objects.filter(pi2__t2=trash_time_tag, v__lt=int(time.time())-10).delete() # replace trash system with Pack_Type
            #Part.objects.filter(~Q(pi1__t2=trash_time_tag), t=trash_tag, u=user).delete()


# if include:
#                 for incl in include:
#                     include_filter_parts = Part.objects.filter(**{'p'+incl[0]+'1__t2__v': incl[1], 'p'+incl[0]+'1__n2__v': incl[2]})
#                 parts = parts.intersection(include_filter_parts)


        # get viewable parts
            # if user.is_authenticated: 
            #     viewable_parts = Part.objects.filter(Q(pp1__t2__v='viewer') | Q(pp1__t2__v='editor'), pp1__n2__pu1__n2=user)  
            #     parts = parts.union(viewable_parts)

# included = Q()
#             if include:
#                 for incl in include: included &= Q(**{'p'+incl[0]+'1__t2__v': incl[1], 'p'+incl[0]+'1__n2__v': incl[2]})

# class Edit_Part(graphene.Mutation): 
#     class Arguments:
#         toNew = graphene.Boolean(required=True)
#         id = graphene.String(required=True)
#         name = graphene.String(required=True)
#         public = graphene.Boolean(required=True)
#         story = graphene.String(required=False, default_value = '')
#         blob = Upload(required=False, default_value = None)
#         parts = graphene.List(graphene.List(graphene.ID, required=False, default_value=[]), required=False, default_value=[])
#     project = graphene.Field(Project_Type)
#     reply = graphene.String(default_value = 'Failed to save or copy project.') 
#     @classmethod
#     def mutate(cls, root, info, toNew, id, name, public, story, blob, parts):
#         try:
#             project = None
#             if info.context.user.is_authenticated:  
#                 if toNew:  project = Project.objects.get(id = id)
#                 else:      project = Project.objects.get(id = id, owner=info.context.user)
#                 reply = 'Saved'
#                 #print(parts)
#                 #prev_parts = None
#                 if toNew: 
#                     #if not parts: prev_parts = project.parts.all()#[part.id for part in project.parts.all()]
#                     reply = 'Copied '+project.name+' as '+name
#                     project.id = None
#                     #project.date = str(django.utils.timezone.now)
#                 #else: 
#                     #if parts: project.parts.set(parts[1:])
#                 project.name = name
#                 project.owner = info.context.user
#                 project.public = public
#                 if story: project.story = story[1:] # remove first 't' character (use not story == None instead?)
#                 if blob: project.file.save(make_id()+'.glb', blob, save = True) # automatrically call project.save()
#                 else: project.file.save(make_id()+'.glb', project.file, save = True) 
#                 #if toNew: 
#                 #    if prev_parts: parts = prev_parts
#                 #    else: parts = Part.objects.filter(id__in=parts[1:])
#                 #    for part in parts: part.projects.add(project.id)
#                 return Edit_Project(reply=reply, project=project) 
#         except Exception as e: print(e)
#         return Edit_Project() 

# class Delete_Project(graphene.Mutation):
#     class Arguments:
#         id = graphene.String(required=True)
#     project = graphene.Field(Project_Type)
#     reply = graphene.String(default_value = 'Failed to delete project.')
#     @classmethod
#     def mutate(cls, root, info, id):
#         try:
#             project = Project.objects.get(id=id, owner=info.context.user)
#             project.delete()
#             return Delete_Project(reply='Deleted '+project.name + '.', project=project)
#         except Exception as e: print(e)
#         return Delete_Project()




            # select dependancy records to specified depth
            # def union_parts(parts, current_parts, depth):
            #     if depth > 0 or depth < 0:
            #         next_parts = Part.objects.none()
            #         for p in current_parts: next_parts = next_parts.union(p.p.all()) 
            #         if len(next_parts.all()) > 0 and len(next_parts.difference(parts).all()) > 0:
            #             parts = parts.union(next_parts)
            #             print(parts)
            #             depth = union_parts(parts, next_parts, depth-1) 
            #     return depth
            #depth = union_parts(parts, parts, depth)

# current_parts = parts.all()
            # while depth >= 0 or not depth:
            #     depth -= 1
            #     next_parts = Part.objects.none()
            #     for p in current_parts: next_parts = next_parts.union(p.p.all()) 

#q = Q(**{'p'+include[0][0]+'1__t2__v': include[0][1], 'p'+include[0][0]+'1__n2__v': include[0][2]})
                #for incl in include[1:]: q |= Q(**{'p'+incl[0]+'1__t2__v': incl[1], 'p'+incl[0]+'1__n2__v': incl[2]})

# class Pack_Type(graphene.ObjectType):
#     #def __init__(self,roots): self.root = root # roots is one part that contains p, t, 
#     root = graphene.List(Part_Type) 
#     p = graphene.List(Part_Type) 
#     t = graphene.List(Tag_Type) 
#     b = graphene.List(Bool_Type) 
#     i = graphene.List(Int_Type) 
#     f = graphene.List(Float_Type) 
#     s = graphene.List(String_Type) 
#     def resolve_root(self, info):
#         return root
#     def resolve_p(self, info):
#         try: return c_list(self.groups,'p') #Part.objects.filter(id__in=self.groups.values_list('c', flat=True))
#         except Exception as e: print(e)
#     def resolve_t(self, info):
#         try: return c_list(self.groups,'t')#Tag.objects.filter(id__in=self.groups.values_list('t', flat=True))
#         except Exception as e: print(e)
#     def resolve_b(self, info):
#         try: return c_list(self.groups,'b')#Bool.objects.filter(id__in=self.groups.values_list('b', flat=True))
#         except Exception as e: print(e)
#     def resolve_i(self, info):
#         try: return c_list(self.groups,'i')#Int.objects.filter(id__in=self.groups.values_list('i', flat=True))
#         except Exception as e: print(e)
#     def resolve_f(self, info):
#         try: return c_list(self.groups,'f')#Float.objects.filter(id__in=self.groups.values_list('f', flat=True))
#         except Exception as e: print(e)
#     def resolve_s(self, info):
#         try: return c_list(self.groups,'s')#String.objects.filter(id__in=self.groups.values_list('s', flat=True))
#         except Exception as e: print(e)

# def resolve_pack(root, info): # include, exclude filters   offset, limit for pages
#         try:
#             user = info.context.user
#             #public_parts = String.objects.get(v=public).p
#             if user.is_authenticated: 
#                 #user_viewable_parts = user.p.intersection(String.objects.get(v=view_list).p.all()).p
#                 viewables = common(user.r, tagged('viewable'))
#                 return Pack_Type(tagged('public').union(viewables)) #Part.objects.filter(Q(public=True) | Q(owner=info.context.user))
#             else: return Pack_Type(tagged('public')) #Part.objects.filter()
#         except Exception as e: print(e)
#         return None





# class Edit_Project(graphene.Mutation): 
#     class Arguments:
#         toNew = graphene.Boolean(required=True)
#         id = graphene.String(required=True)
#         name = graphene.String(required=True)
#         public = graphene.Boolean(required=True)
#         story = graphene.String(required=False, default_value = '')
#         blob = Upload(required=False, default_value = None)
#         parts = graphene.List(graphene.List(graphene.ID, required=False, default_value=[]), required=False, default_value=[])
#     project = graphene.Field(Project_Type)
#     reply = graphene.String(default_value = 'Failed to save or copy project.') 
#     @classmethod
#     def mutate(cls, root, info, toNew, id, name, public, story, blob, parts):
#         try:
#             project = None
#             if info.context.user.is_authenticated:  
#                 if toNew:  project = Project.objects.get(id = id)
#                 else:      project = Project.objects.get(id = id, owner=info.context.user)
#                 reply = 'Saved'
#                 #print(parts)
#                 #prev_parts = None
#                 if toNew: 
#                     #if not parts: prev_parts = project.parts.all()#[part.id for part in project.parts.all()]
#                     reply = 'Copied '+project.name+' as '+name
#                     project.id = None
#                     #project.date = str(django.utils.timezone.now)
#                 #else: 
#                     #if parts: project.parts.set(parts[1:])
#                 project.name = name
#                 project.owner = info.context.user
#                 project.public = public
#                 if story: project.story = story[1:] # remove first 't' character (use not story == None instead?)
#                 if blob: project.file.save(make_id()+'.glb', blob, save = True) # automatrically call project.save()
#                 else: project.file.save(make_id()+'.glb', project.file, save = True) 
#                 #if toNew: 
#                 #    if prev_parts: parts = prev_parts
#                 #    else: parts = Part.objects.filter(id__in=parts[1:])
#                 #    for part in parts: part.projects.add(project.id)
#                 return Edit_Project(reply=reply, project=project) 
#         except Exception as e: print(e)
#         return Edit_Project() 

# class Delete_Project(graphene.Mutation):
#     class Arguments:
#         id = graphene.String(required=True)
#     project = graphene.Field(Project_Type)
#     reply = graphene.String(default_value = 'Failed to delete project.')
#     @classmethod
#     def mutate(cls, root, info, id):
#         try:
#             project = Project.objects.get(id=id, owner=info.context.user)
#             project.delete()
#             return Delete_Project(reply='Deleted '+project.name + '.', project=project)
#         except Exception as e: print(e)
#         return Delete_Project()

# class Mutation(graphene.ObjectType):
#     login = Login.Field()
#     logout = Logout.Field()
#     editProject = Edit_Project.Field()
#     deleteProject = Delete_Project.Field()




# class CopyProject(graphene.Mutation):
#     class Arguments:
#         id = graphene.String(required=True)
#         name = graphene.String(required=True)
#         story = graphene.String(required=False, default_value=None)
#     project = graphene.Field(Project_Type)
#     @classmethod
#     def mutate(cls, root, info, id, name, story):
#         project = None
#         if info.context.user.is_authenticated:  
#             project = Project.objects.get(id=id)
#             if project:  
#                 project.id = None
#                 project.name = name
#                 project.owner = info.context.user
#                 project.public = False
#                 if story: project.story = story
#                 project.file.save(make_id() + '.glb', project.file, save = True)
#         return CopyProject(project=project)


#owner_name = graphene.String()
    #@staticmethod
    #def resolve_owner_name(root, info, **kwargs):
    #    return 'Hello World!'

# @classmethod
#     def get_queryset(cls, queryset, info):
#         if info.context.user.is_anonymous:
#             return queryset.filter(published=True)
#         return queryset

#login = graphene.Field(User_Type, username=graphene.String(required=True), password=graphene.String(required=True))
    #logout = graphene.Field(User_Type)

    #def resolve_login(root, info, username, password):
    #    user = authenticate(username=username, password=password)
    #    if user is not None: login(info.context, user)
    #    return user

    # def resolve_logout(root, info):
    #     if info.context.user.is_authenticated: 
    #         user = info.context.user
    #         logout(info.context)
    #         return user
    #     else: return None

#try: return Project.objects.get(id=id)
#except Project.DoesNotExist: return None

#from django.contrib.auth import authenticate
#user = authenticate(username='john', password='secret')



#project_by_name = graphene.Field(Project_Type, name=graphene.String(required=True))

# def resolve_project_by_name(root, info, name):
    #     print(name)
    #     try: return Project.objects.get(name=name)
    #     except Project.DoesNotExist: return None