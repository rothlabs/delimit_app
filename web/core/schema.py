import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth.models import User
from core.models import make_id, Part, Tag, Bool, Int, Float, String#, Time
from core.models import Part_Part, Part_Bool, Part_Int, Part_Float, Part_String#, Part_Time
from django.db.models import Q
from django.contrib.auth import authenticate, login, logout
from graphene_file_upload.scalars import Upload
import django.utils
from core.part import tagged, common#, c_list
from time import time

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

trash_tag = Tag.objects.get(v='trash') # users must never be allowed to add this tag to anything! Forbidden in mutations
trash_time_tag = Tag.objects.get(v='trash_time') # users must never be allowed to add this tag to anything! Forbidden in mutations
editor_tag = Tag.objects.get(v='editor')
editable_tag = Tag.objects.get(v='editable')

def clear_part(part):
    part.p.clear()
    part.b.clear()
    part.i.clear()
    part.f.clear()
    part.s.clear()

class Query(graphene.ObjectType):
    user = graphene.Field(Authenticated_User_Type)
    pack = graphene.Field(Part_Type)
    def resolve_user(root, info):
        if info.context.user.is_authenticated: return info.context.user
        else: return None
    def resolve_pack(root, info): 
        try:
            buffer_pack = None
            user = info.context.user
            if user.is_authenticated:
                # if the units in the poll_pack refer to units that the client does not have open, it is up to the client to decide to open them or not
                poll_pack = Pack.objects.get(t__v='poll_pack', pu1__m2=user)
                buffer_pack = Pack.objects.get(t__v='buffer_pack', pu1__m2=user)
                buffer_pack.p.set(poll_pack.p)
                buffer_pack.b.set(poll_pack.b)
                buffer_pack.i.set(poll_pack.i)
                buffer_pack.f.set(poll_pack.f)
                buffer_pack.s.set(poll_pack.s)
                clear_part(poll_pack)
            return buffer_pack
        except Exception as e: print(e)
        return None

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
            # delete trash if older than 10 seconds (move to another function that does it periodically)
            Int.objects.filter(pi2__t2=trash_time_tag, v__lt=int(time())-10).delete()
            Part.objects.filter(~Q(pi1__t2=trash_time_tag), t=trash_tag).delete()
            # get context
            user = info.context.user
            # record time:
            time_int = Int.objects.create(v=int(time()))
            # filter by ids:
            if ids: parts = Part.objects.filter(id__in = ids)
            # filter by public and viewable :
            is_public = Q(pb1__t2__v='public', pb1__m2__v=True)
            viewable = Q(Q(pp2__t1__v='viewer') | Q(pp2__t1__v='editor'), pp2__m1__pu1__m2=user)# & Q(pp1__m2__pu1__m2=user) is_owner = Q(pu1__t2__v='owner', pu1__m2=user)
            parts = parts.filter(is_public | viewable)
            # filter by include and exclude props:
            for prop in include:
                parts = parts.filter(**{'p'+prop[0]+'1__t2__v': prop[1], 'p'+prop[0]+'1__m2__v': prop[2]})
            for prop in exclude:
                parts = parts.filter(~Q(**{'p'+prop[0]+'1__t2__v': prop[1], 'p'+prop[0]+'1__m2__v': prop[2]}))
            # make root:
            root = Part.objects.create(t=trash_tag)
            root.i.add(time_int, through_defaults={'t2':trash_time_tag})
            root.p.set(parts.all())
            # get dependencies filtered by public and viewable
            if not depth: depth = -1
            current_parts = parts.all()
            while depth > 0 or depth < 0:  # replace with Part.objects.raw(recursive sql)!!!!
                next_parts = Part.objects.none()
                for p in current_parts: 
                    next_parts = next_parts.union(p.p.filter(is_public | viewable).all()) 
                if len(next_parts.all()) > 0 and len(next_parts.difference(parts).all()) > 0:
                    parts = parts.union(next_parts)
                    current_parts = next_parts.all()
                    depth -= 1
                else: break
            bools   = Bool.objects.none()
            ints    = Int.objects.none()
            floats  = Float.objects.none()
            strings = String.objects.none()
            for p in parts: bools   = bools.union(p.b.all()) # add reverse public and viewable filters 
            for p in parts: ints    = ints.union(p.i.all())
            for p in parts: floats  = floats.union(p.f.all())  
            for p in parts: strings = strings.union(p.s.all())  
            # make pack:
            pack = Part.objects.create(t=trash_tag) 
            pack.i.add(time_int, through_defaults={'t2':trash_time_tag})
            pack.p.set(parts.all(), through_defaults={'n':1,'t1':trash_tag}) 
            pack.p.add(root, through_defaults={'n':0,'t1':trash_tag, 't2':trash_tag})   
            pack.b.set(bools.all(), through_defaults={'t1':trash_tag})
            pack.i.set(ints.all(), through_defaults={'t1':trash_tag})
            pack.f.set(floats.all(), through_defaults={'t1':trash_tag})
            pack.s.set(strings.all(), through_defaults={'t1':trash_tag})
            # add to opened pack (filter out objects without view permission?)
            if user.is_authenticated: 
                open_pack = Part.objects.get(t__v='open_pack', pu1__m2=user)
                open_pack.p.set(open_pack.p.union(parts))
                open_pack.b.set(open_pack.b.union(bools))
                open_pack.i.set(open_pack.i.union(ints))
                open_pack.f.set(open_pack.f.union(floats))
                open_pack.s.set(open_pack.s.union(strings))
            # return pack:
            return Open_Pack(pack=pack, reply='Parts opened.')
        except Exception as e: print(e)
        return Open_Pack()

class Push_Pack(graphene.Mutation):
    class Arguments:
        #parts = graphene.List(graphene.ID)
        vids = graphene.List(graphene.List(graphene.ID)) # vids[m][id]
        b = graphene.List(graphene.Boolean)
        i = graphene.List(graphene.Int)
        f = graphene.List(graphene.Float)
        s = graphene.List(graphene.String)
        pids = graphene.List(graphene.List(graphene.List(graphene.ID))) # ids[p][m][id] (first m contains one id for the part)
        t1 = graphene.List(graphene.List(graphene.List(graphene.String))) # t1[p][m][id] (first m containts part tag)
        t2 = graphene.List(graphene.List(graphene.List(graphene.String))) # t2[p][m][id] (first m containts tags for sub parts)
    #pack = graphene.Field(Part_Type)
    reply = graphene.String(default_value = 'Failed to close pack.')
    def get_or_create_atom(model_cls, m, id, user, buffer_pack): # check if m is correct value?
        obj = None
        try: obj = model_cls.objects.get(**{'id':id, 'p'+m+'2__t1__v':'editor', 'p'+m+'2__m1__pu1__m2':user})
        except Exception as e: print(e)
        if not obj:
            try: 
                team = Part.objects.get(t__v='team', pu1__t2__v='owner', pu1__m2=user)
                obj = model_cls.objects.create(id=id).object
                team[m].add(obj, through_defaults={'t1':editor_tag, 't2':editable_tag}) # getattr
            except Exception as e: print(e)
        if obj: buffer_pack[m].add(obj)
        return obj
    def add_atom(part, model_cls, m, id, index, t1, t2): # check if m is correct value?
        try:
            tag1 = Tag.objects.get(v=t1)
            tag2 = Tag.objects.get(v=t2)
            if tag1=='editor' or tag2=='editable': # check against list of allowable tags!!!
                obj = model_cls.objects.get(**{'id':id, 'p'+m+'2__t1__v':'editor', 'p'+m+'2__m1__pu1__m2':user})
            else: obj = model_cls.objects.get(id=id) 
            part[m].add(obj, through_defaults={'n':index, 't1':tag1, 't2':tag2})
        except Exception as e: print(e)
    @classmethod
    def mutate(cls, root, info, vids, b, i, f, s, pids, t1, t2): # should set default team in case client fails to assign team to part?
        try:
            user = info.context.user
            if user.is_authenticated: 
                buffer_pack = Pack.objects.get(t__v='buffer_pack', pu1__m2=user)
                clear_part(buffer_pack)
                if vids:
                    # mutate atoms: 
                    for idi in range(len(vids[0])-1):
                        obj = get_or_create_atom(Bool, 'b', vids[0][idi], user, buffer_pack)
                        if obj:
                            obj.v = b[idi]
                            obj.save()
                    for idi in range(len(vids[1])-1):
                        obj = get_or_create_atom(Int, 'i', vids[1][idi], user, buffer_pack)
                        if obj:
                            obj.v = i[idi]
                            obj.save()
                    for idi in range(len(vids[2])-1):
                        obj = get_or_create_atom(Float, 'f', vids[2][idi], user, buffer_pack)
                        if obj:
                            obj.v = f[idi]
                            obj.save()
                    for idi in range(len(vids[3])-1):
                        obj = get_or_create_atom(String, 's', vids[3][idi], user, buffer_pack)
                        if obj:
                            obj.v = s[idi]
                            obj.save()
                editable = Q(pp2__t1__v='editor', pp2__m1__pu1__m2=user)
                if pids and len(pids) == len(t1) and len(pids) == len(t2):
                    # make parts if don't exist:
                    for p in range(len(pids)-1): # use this loop to build list of parts for next loop
                        part = None
                        try: part = Part.objects.get(editable, id=pids[p][0][0])
                        except Exception as e: print(e)
                        if not part:
                            try: 
                                team = Part.objects.get(t__v='team', pu1__t2__v='owner', pu1__m2=user)
                                part = Part.objects.create(id=pids[p][0][0]).object
                                team.p.add(part, through_defaults={'t1':editor_tag, 't2':editable_tag})
                            except Exception as e: print(e)
                    # mutate parts
                    for p in range(len(pids)-1): # need to check if id is in correct format
                        try: # could remove this try wrap?
                            part = Part.objects.get(editable, id=pids[p][0][0])
                            part.t = Tag.objects.get_or_create(v=t1[p][0][0]).object
                            part.save()
                            clear_part(part)
                            buffer_pack.p.add(part)
                            for idi in range(len(pids[p][1])-1):
                                try:
                                    tag1 = Tag.objects.get(v=t1[p][1][idi])
                                    tag2 = Tag.objects.get(v=t2[p][1][idi])
                                    if tag1=='editor' or tag2=='editable': # check against list of allowable tags!!!
                                        obj = Part.objects.get(editable, id = pids[p][1][idi])
                                    else: obj = Part.objects.get(id = pids[p][1][idi]) 
                                    part.p.add(obj, through_defaults={'n':idi, 't1':tag1, 't2':tag2})
                                except Exception as e: print(e)
                            for idi in range(len(pids[p][2])-1):
                                add_atom(part, Bool, 'b', pids[p][2][idi], idi, t1[p][2][idi], t2[p][2][idi])
                            for idi in range(len(pids[p][3])-1):
                                add_atom(part, Int, 'i', pids[p][3][idi], idi, t1[p][3][idi], t2[p][3][idi])
                            for idi in range(len(pids[p][4])-1):
                                add_atom(part, Float, 'f', pids[p][4][idi], idi, t1[p][4][idi], t2[p][4][idi])
                            for idi in range(len(pids[p][5])-1):
                                add_atom(part, String, 's', pids[p][5][idi], idi, t1[p][5][idi], t2[p][5][idi])
                        except Exception as e: print(e)
                for p in buffer_pack.p: # do this for b, i, f, s as well
                    poll_packs = Part.objects.filter(t__V='poll_pack', pp1__t2__v='open_pack', pp1__m2__p = p)
                    poll_packs.p.add(p) #for poll_pack in poll_packs: poll_pack.p.add(p)
                clear_part(buffer_pack) # not really needed? 
            return Push_Pack(reply='Clsoed pack.')
        except Exception as e: print(e)
        return Push_Pack()

class Close_Pack(graphene.Mutation):
    class Arguments:
        ids = graphene.List(graphene.ID)
        # bids = graphene.List(graphene.ID)
        # iids = graphene.List(graphene.ID)
        # fids = graphene.List(graphene.ID)
        # sids = graphene.List(graphene.ID)
    #pack = graphene.Field(Part_Type)
    reply = graphene.String(default_value = 'Failed to close pack.')
    @classmethod
    def mutate(cls, root, info, ids):#, bids, iids, fids, sids):
        try:
            user = info.context.user
            if user.is_authenticated: 
                parts = Part.objects.filter(id__in=ids)
                open_pack = Part.objects.get(t__v='open_pack', pu1__m2=user)
                open_pack.p.set(open_pack.p.difference(parts.p))
                open_pack.b.set(open_pack.b.difference(parts.b))
                open_pack.i.set(open_pack.i.difference(parts.i))
                open_pack.f.set(open_pack.f.difference(parts.f))
                open_pack.s.set(open_pack.s.difference(parts.s))
            return Close_Pack(reply='Clsoed pack.')
        except Exception as e: print(e)
        return Close_Pack()

class Mutation(graphene.ObjectType):
    login = Login.Field()
    logout = Logout.Field()
    open_pack = Open_Pack.Field()
    push_pack = Push_Pack.Field()
    close_pack = Close_Pack.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)



# if include:
#                 for incl in include:
#                     include_filter_parts = Part.objects.filter(**{'p'+incl[0]+'1__t2__v': incl[1], 'p'+incl[0]+'1__m2__v': incl[2]})
#                 parts = parts.intersection(include_filter_parts)


        # get viewable parts
            # if user.is_authenticated: 
            #     viewable_parts = Part.objects.filter(Q(pp1__t2__v='viewer') | Q(pp1__t2__v='editor'), pp1__m2__pu1__m2=user)  
            #     parts = parts.union(viewable_parts)

# included = Q()
#             if include:
#                 for incl in include: included &= Q(**{'p'+incl[0]+'1__t2__v': incl[1], 'p'+incl[0]+'1__m2__v': incl[2]})

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

#q = Q(**{'p'+include[0][0]+'1__t2__v': include[0][1], 'p'+include[0][0]+'1__m2__v': include[0][2]})
                #for incl in include[1:]: q |= Q(**{'p'+incl[0]+'1__t2__v': incl[1], 'p'+incl[0]+'1__m2__v': incl[2]})

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