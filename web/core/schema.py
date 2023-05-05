import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth.models import User
from core.models import make_id, Part, Tag, Bool, Int, Float, String#, Time
from core.models import Part_Part, Part_Bool, Part_Int, Part_Float, Part_String#, Part_Time
from core.models import tag
from django.db.models import Q
from django.contrib.auth import authenticate, login, logout
from graphene_file_upload.scalars import Upload
import django.utils
#from core.part import tagged, common#, c_list
#import time#, sched
#import itertools

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

def clear_part(part):
    part.p.clear()
    part.b.clear()
    part.i.clear()
    part.f.clear()
    part.s.clear()

class Query(graphene.ObjectType):
    user = graphene.Field(Authenticated_User_Type)
    pollPack = graphene.Field(Part_Type)
    def resolve_user(root, info):
        if info.context.user.is_authenticated: return info.context.user
        else: return None
    def resolve_pollPack(root, info): 
        try:
            user = info.context.user
            if user.is_authenticated:
                return Part.objects.get(t__v='poll_pack', u=user)
            return None
        except Exception as e: print(e)
        return None

class Clear_Poll(graphene.Mutation):
    reply = graphene.String(default_value = 'Failed to clear poll.')
    @classmethod
    def mutate(cls, root, info):
        try:
            user = info.context.user
            if user.is_authenticated: 
                clear_part(Part.objects.get(t__v='poll_pack', u=user))
            return Clear_Poll(reply='Cleared Poll.')
        except Exception as e: print(e)
        return Clear_Poll()

class Open_Pack(graphene.Mutation):
    class Arguments:
        depth = graphene.Int()
        ids = graphene.List(graphene.ID)
        include = graphene.List(graphene.List(graphene.String))
        exclude = graphene.List(graphene.List(graphene.String))
    pack = graphene.Field(Part_Type)
    reply = graphene.String(default_value = 'Failed to open pack.')
    @classmethod
    def mutate(cls, root, info, depth, ids, include, exclude): # offset, limit for pages
        try:
            # get context
            user = info.context.user
            # filter by ids:
            parts = None
            if ids: parts = Part.objects.filter(id__in = ids)
            # filter by public and viewable :
            public = Q(r__t__v='public') | Q(t__v='public') #  Q(pb1__t2__v='public', pb1__n2__v=True)
            if user.is_authenticated: viewable = Q(r__t__v='profile', r__u=user) | Q(t__v='profile', u=user)#   pp2__n1__u=user?   pp2__n1__pu1__n2   r__u    & Q(pp1__n2__pu1__n2=user) is_owner = Q(pu1__t2__v='owner', pu1__n2=user)
            else: viewable = Q(pk__in=[]) # always false
            #viewable_by_team = Q(Q(pp2__t1__v='viewer') | Q(pp2__t1__v='editor'), pp2__n1__pp1__t2='member', pp2__n1__pp1__n2__u=user) # r__t__v='viewer'
            if parts: parts = parts.filter(public | viewable).distinct()
            else: parts = Part.objects.filter(public | viewable).distinct()
            #print(parts.all())
            # filter by include and exclude props:
            if include:
                for prop in include:
                    if prop[0]=='b': parts = parts.filter(pe__t__v=prop[1], n__v=prop[2]=='true').distinct() # is it higher or lower case?
                    if prop[0]=='i': parts = parts.filter(ie__t__v=prop[1], n__v=int(prop[2])).distinct()
                    if prop[0]=='f': parts = parts.filter(fe__t__v=prop[1], n__v=float(prop[2])).distinct()
                    if prop[0]=='s': parts = parts.filter(se__t__v=prop[1], n__v=prop[2]).distinct()
            if exclude:
                for prop in exclude:
                    if prop[0]=='b': parts = parts.filter(~Q(pe__t__v=prop[1], n__v=prop[2]=='true')).distinct() # is it higher or lower case?
                    if prop[0]=='i': parts = parts.filter(~Q(ie__t__v=prop[1], n__v=int(prop[2]))).distinct()
                    if prop[0]=='f': parts = parts.filter(~Q(fe__t__v=prop[1], n__v=float(prop[2]))).distinct()
                    if prop[0]=='s': parts = parts.filter(~Q(se__t__v=prop[1], n__v=prop[2])).distinct()
            # get dependencies filtered by public and viewable
            if depth is None: depth = -1
            current_parts = parts.all()
            while depth > 0 or depth < 0:  # replace with Part.objects.raw(recursive sql)!!!!
                next_parts = Part.objects.none()
                for p in current_parts: 
                    next_parts = next_parts.union(p.p.filter(public | viewable).distinct()) 
                if len(next_parts.all()) > 0 and len(next_parts.difference(parts).all()) > 0:
                    parts = parts.union(next_parts)
                    current_parts = next_parts.all()
                    depth -= 1
                else: break
            # get atoms:
            bools   = Bool.objects.filter(p__in=parts)#.filter(Q(pb2__t1__v='public') | Q(Q(pb2__t1__v='viewer') | Q(pb2__t1__v='editor'), pb2__n1__u=user)) 
            ints    = Int.objects.filter(p__in=parts)#.filter(Q(pi2__t1__v='public') | Q(Q(pi2__t1__v='viewer') | Q(pi2__t1__v='editor'), pi2__n1__u=user))
            floats  = Float.objects.filter(p__in=parts)#.filter(Q(pf2__t1__v='public') | Q(Q(pf2__t1__v='viewer') | Q(pf2__t1__v='editor'), pf2__n1__u=user))
            strings = String.objects.filter(p__in=parts)#.filter(Q(ps2__t1__v='public') | Q(Q(ps2__t1__v='viewer') | Q(ps2__t1__v='editor'), ps2__n1__u=user))
            # add to open_pack
            if user.is_authenticated: 
                open_pack = Part.objects.get(t__v='open_pack', u=user) # pu1__n2=user
                open_pack.p.add(*parts, through_defaults={'t':tag['open_pack']}) #.set(open_pack.p.union(parts), through_defaults={'t1':open_pack_tag})
                open_pack.b.add(*bools, through_defaults={'t':tag['open_pack']})
                open_pack.i.add(*ints, through_defaults={'t':tag['open_pack']})
                open_pack.f.add(*floats, through_defaults={'t':tag['open_pack']})
                open_pack.s.add(*strings, through_defaults={'t':tag['open_pack']})
            # return pack:
            return Open_Pack(pack=Part_Type(p=parts, b=bools, i=ints, f=floats, s=strings), reply='Parts opened.')
        except Exception as e: print(e)
        return Open_Pack()

class Close_Pack(graphene.Mutation):
    class Arguments:
        ids = graphene.List(graphene.ID)
    reply = graphene.String(default_value = 'Failed to close pack.')
    @classmethod
    def mutate(cls, root, info, ids):
        try:
            user = info.context.user
            if user.is_authenticated: 
                parts = Part.objects.filter(id__in=ids)
                open_pack = Part.objects.get(t__v='open_pack', u=user) # pu1__n2=user
                open_pack.p.remove(parts.p) #(open_pack.p.difference(parts.p), through_defaults={'t1':open_pack_tag})
                open_pack.b.remove(parts.b)
                open_pack.i.remove(parts.i)
                open_pack.f.remove(parts.f)
                open_pack.s.remove(parts.s)
            return Close_Pack(reply='Closed pack.')
        except Exception as e: print(e)
        return Close_Pack()

permission_tags = ['public', 'asset', 'owner', 'view', 'viewer'] 
class Push_Pack(graphene.Mutation):
    class Arguments:
        vids = graphene.List(graphene.List(graphene.ID)) # vids[m][id]
        b = graphene.List(graphene.Boolean)
        i = graphene.List(graphene.Int)
        f = graphene.List(graphene.Float)
        s = graphene.List(graphene.String)
        pids = graphene.List(graphene.List(graphene.List(graphene.ID))) # ids[p][m][id] (first m contains one id for the part)
        t1 = graphene.List(graphene.List(graphene.List(graphene.String))) # t1[p][m][id] (first m containts part tag)
        t2 = graphene.List(graphene.List(graphene.List(graphene.String))) # t2[p][m][id] (first m containts tags for sub parts)
    reply = graphene.String(default_value = 'Failed to push pack.')
    def get_or_create_atom(model, m, id, user, temp_pack): # check if m is correct value?
        obj = None
        try: obj = model.objects.get(**{'id':id, 'p'+m+'2__t1':tag['owner'], 'r__u':user}) #model.objects.get(**{'id':id, 'p'+m+'2__t1__v':'editor', 'p'+m+'2__n1__u':user}) #'p'+m+'2__n1__pu1__n2':user
        except Exception as e: print(e)
        if not obj:
            try: 
                person = Part.objects.get(u=user) 
                obj = model.objects.create(id=id)
                getattr(person,m).add(obj, through_defaults={'t1':tag['owner'], 't2':tag['asset']}) 
                #temp_pack.p.append(team)
            except Exception as e: print(e)
        #if obj: temp_pack[m].append(obj)
        return obj
    def add_atom(part, model_cls, m, id, index, t1, t2, temp_pack): # check if m is correct value?
        try:
            tag1 = Tag.objects.get(v=t1, system=False)
            tag2 = Tag.objects.get(v=t2, system=False)
            if tag1.v in permission_tags or tag2.v in permission_tags: 
                obj = model_cls.objects.get(**{'id':id, 'p'+m+'2__t1__v':'editor', 'p'+m+'2__n1__u':user}) #'p'+m+'2__n1__pu1__n2':user
            else: obj = model_cls.objects.get(id=id) 
            part[m].add(obj, through_defaults={'o':index, 't1':tag1, 't2':tag2})
            #temp_pack[m].append(obj)
        except Exception as e: print(e)
    @classmethod
    def mutate(cls, root, info, vids, b, i, f, s, pids, t1, t2): # should set default team in case client fails to assign team to part?
        try:
            user = info.context.user
            if user.is_authenticated: 
                temp_pack = {p:[], b:[], i:[], f:[], s:[]}
                if vids:
                    # mutate atoms: 
                    for idi in range(len(vids[0])-1):
                        obj = get_or_create_atom(Bool, 'b', vids[0][idi], user, temp_pack)
                        if obj:
                            obj.v = b[idi]
                            obj.save()
                    for idi in range(len(vids[1])-1):
                        obj = get_or_create_atom(Int, 'i', vids[1][idi], user, temp_pack)
                        if obj:
                            obj.v = i[idi]
                            obj.save()
                    for idi in range(len(vids[2])-1):
                        obj = get_or_create_atom(Float, 'f', vids[2][idi], user, temp_pack)
                        if obj:
                            obj.v = f[idi]
                            obj.save()
                    for idi in range(len(vids[3])-1):
                        obj = get_or_create_atom(String, 's', vids[3][idi], user, temp_pack)
                        if obj:
                            obj.v = s[idi]
                            obj.save()
                editable = Q(pp2__t1__v='editor', pp2__n1__u=user) # pp2__n1__pu1__n2=user
                if pids and len(pids) == len(t1) and len(pids) == len(t2):
                    # make parts if don't exist:
                    for p in range(len(pids)-1): # use this loop to build list of parts for next loop
                        part = None
                        try: part = Part.objects.get(editable, id=pids[p][0][0])
                        except Exception as e: print(e)
                        if not part:
                            try: 
                                person = Part.objects.get(u=user) #team = Part.objects.get(t__v='team', pu1__t2__v='owner', u=user) # pu1__n2=user
                                part = Part.objects.create(id=pids[p][0][0]).object
                                person.p.add(obj, through_defaults={'t2':editable_tag}) # team.p.add(part, through_defaults={'t1':editor_tag, 't2':editable_tag})
                                #temp_pack.p.append(team)
                            except Exception as e: print(e)
                    # mutate parts
                    for p in range(len(pids)-1): # need to check if id is in correct format
                        try: # could remove this try wrap?
                            part = Part.objects.get(editable, id=pids[p][0][0])
                            part.t = Tag.objects.get(v=t1[p][0][0], system=False)
                            part.save()
                            clear_part(part)
                            #temp_pack.p.append(part)
                            for idi in range(len(pids[p][1])-1):
                                try:
                                    tag1 = Tag.objects.get(v=t1[p][1][idi], system=False)
                                    tag2 = Tag.objects.get(v=t2[p][1][idi], system=False)
                                    if tag1.v in permission_tags or tag2.v in permission_tags: 
                                        obj = Part.objects.get(editable, id = pids[p][1][idi])
                                    else: obj = Part.objects.get(id = pids[p][1][idi]) 
                                    part.p.add(obj, through_defaults={'o':idi, 't1':tag1, 't2':tag2})
                                    #temp_pack.p.append(obj)
                                except Exception as e: print(e)
                            for idi in range(len(pids[p][2])-1):
                                add_atom(part, Bool, 'b', pids[p][2][idi], idi, t1[p][2][idi], t2[p][2][idi], temp_pack)
                            for idi in range(len(pids[p][3])-1):
                                add_atom(part, Int, 'i', pids[p][3][idi], idi, t1[p][3][idi], t2[p][3][idi], temp_pack)
                            for idi in range(len(pids[p][4])-1):
                                add_atom(part, Float, 'f', pids[p][4][idi], idi, t1[p][4][idi], t2[p][4][idi], temp_pack)
                            for idi in range(len(pids[p][5])-1):
                                add_atom(part, String, 's', pids[p][5][idi], idi, t1[p][5][idi], t2[p][5][idi], temp_pack)
                        except Exception as e: print(e)
                # add to poll packs:
                #for p in temp_pack.p: # do this for b, i, f, s as well
                #    poll_packs = Part.objects.filter(t__V='poll_pack', pp2__t1__v='open_pack', pp2__n1__p = p)
                #    for poll_pack in poll_packs: poll_pack.p.add(p, through_defaults={'t1':poll_pack_tag})
            return Push_Pack(reply='Pushed pack.')
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
    clearPoll = Clear_Poll.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)





def make_test_data():
    t = {t: Tag.objects.get_or_create(v=t)[0] for t in [
        'name', 'x', 'y', 'z', 'point', 'public', 'profile', 'user', 'asset', 'view',
    ]}
    user1 = User.objects.get(id=1)
    String.objects.all().delete()
    name1 = String.objects.create(v='Pink')
    name2 = String.objects.create(v='Orange')
    Float.objects.all().delete()
    x1 = Float.objects.create(v=1.11)
    y1 = Float.objects.create(v=2.22)
    z1 = Float.objects.create(v=3.33)
    x2 = Float.objects.create(v=4.44)
    y2 = Float.objects.create(v=5.55)
    z2 = Float.objects.create(v=6.66)
    Part.objects.filter(t__v='point').delete()
    point1 = Part.objects.create(t=t['point'])
    point1.s.add(name1, through_defaults={'t':t['name']})
    point1.f.add(x1, through_defaults={'t':t['x']})
    point1.f.add(y1, through_defaults={'t':t['y']})
    point1.f.add(z1, through_defaults={'t':t['z']})
    point2 = Part.objects.create(t=t['point'])
    point2.s.add(name2, through_defaults={'t':t['name']})
    point2.f.add(x2, through_defaults={'t':t['x']})
    point2.f.add(y2, through_defaults={'t':t['y']})
    point2.f.add(z2, through_defaults={'t':t['z']})
    Part.objects.filter(t__v='profile').delete()
    profile1 = Part.objects.create(t=t['profile'])
    profile1.u.add(user1, through_defaults={'t':t['user']})
    profile1.p.add(point1, through_defaults={'t':t['asset']})
    public = Part.objects.get_or_create(t=t['public'])[0]
    public.p.add(point2, through_defaults={'t':t['view']})
#make_test_data()













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