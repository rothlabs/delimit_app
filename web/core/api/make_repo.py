import json, re
import graphene
#from graph.database import gdbc, gdb_connect
from core.api.config import auth_required_message
#from terminus import WOQLQuery as wq # terminusdb_client
from core.api.util import conform, make_id
from core.models import Repo, Commit, Snap

menu_button_svg = '''<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-menu-button" viewBox="0 0 16 16">
  <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0h8A1.5 1.5 0 0 1 11 1.5v2A1.5 1.5 0 0 1 9.5 5h-8A1.5 1.5 0 0 1 0 3.5v-2zM1.5 1a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-8z"/>
  <path d="m7.823 2.823-.396-.396A.25.25 0 0 1 7.604 2h.792a.25.25 0 0 1 .177.427l-.396.396a.25.25 0 0 1-.354 0zM0 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8zm1 3v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2H1zm14-1V8a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v2h14zM2 8.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0 4a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/>
</svg>
'''

braces_svg = '''<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-braces" viewBox="0 0 16 16">
  <path d="M2.114 8.063V7.9c1.005-.102 1.497-.615 1.497-1.6V4.503c0-1.094.39-1.538 1.354-1.538h.273V2h-.376C3.25 2 2.49 2.759 2.49 4.352v1.524c0 1.094-.376 1.456-1.49 1.456v1.299c1.114 0 1.49.362 1.49 1.456v1.524c0 1.593.759 2.352 2.372 2.352h.376v-.964h-.273c-.964 0-1.354-.444-1.354-1.538V9.663c0-.984-.492-1.497-1.497-1.6zM13.886 7.9v.163c-1.005.103-1.497.616-1.497 1.6v1.798c0 1.094-.39 1.538-1.354 1.538h-.273v.964h.376c1.613 0 2.372-.759 2.372-2.352v-1.524c0-1.094.376-1.456 1.49-1.456V7.332c-1.114 0-1.49-.362-1.49-1.456V4.352C13.51 2.759 12.75 2 11.138 2h-.376v.964h.273c.964 0 1.354.444 1.354 1.538V6.3c0 .984.492 1.497 1.497 1.6z"/>
</svg>
'''

plus_square_svg = '''<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-square" viewBox="0 0 16 16">
  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
</svg>'''

abc_svg = '''<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-type" viewBox="0 0 16 16">
  <path d="m2.244 13.081.943-2.803H6.66l.944 2.803H8.86L5.54 3.75H4.322L1 13.081h1.244zm2.7-7.923L6.34 9.314H3.51l1.4-4.156zm9.146 7.027h.035v.896h1.128V8.125c0-1.51-1.114-2.345-2.646-2.345-1.736 0-2.59.916-2.666 2.174h1.108c.068-.718.595-1.19 1.517-1.19.971 0 1.518.52 1.518 1.464v.731H12.19c-1.647.007-2.522.8-2.522 2.058 0 1.319.957 2.18 2.345 2.18 1.06 0 1.716-.43 2.078-1.011zm-1.763.035c-.752 0-1.456-.397-1.456-1.244 0-.65.424-1.115 1.408-1.115h1.805v.834c0 .896-.752 1.525-1.757 1.525"/>
</svg>'''

class Make_Repo(graphene.Mutation):
    class Arguments:
        name = graphene.String()
        story = graphene.String()
    reply = graphene.String(default_value = 'Failed to make repo')
    @classmethod
    def mutate(cls, root, info, name, story):
        try:
            user = info.context.user
            if not user.is_authenticated:
                return Make_Repo(reply = auth_required_message)

            repo = Repo.objects.create(
                flex = {
                    'name':  conform(name, max_length=64, name=True),
                    'story': conform(story, max_length=512),
                }
            )
            repo.writers.add(user)
            repo.readers.add(user)

            delimit_leaf_node= make_id()
            code_stem        = make_id()
            type_icon_code   = make_id()
            abc_icon_code    = make_id()
            plus_icon_code   = make_id()
            code_icon_code   = make_id()
            name_term        = make_id()
            context_term     = make_id()
            icon_term        = make_id()
            required_term    = make_id()
            optional_term    = make_id()
            pick_one_term    = make_id()
            one_or_more_term = make_id()
            add_term         = make_id()
            make_term        = make_id()
            minimum_term     = make_id()
            maximum_term     = make_id()
            code_term        = make_id()
            root_type        = make_id()
            term_type        = make_id()
            stem_type        = make_id()
            delimit_context  = make_id()
            delimit_app      = make_id()

            snaps = Snap.objects.bulk_create([
                Snap(node=delimit_leaf_node, forw={ 
                    'leaf':[{'type':'xsd:string', 'value':'delimit'}],
                }),Snap(node=code_stem, forw={
                    'name':    [{'type':'xsd:string', 'value':'Code'}],
                    'type':    [{'type':'xsd:string', 'value':'Stem'}],
                    'context': [delimit_leaf_node],
                }),Snap(node=type_icon_code, forw={
                    'name':     [{'type':'xsd:string', 'value':'Type Icon'}],
                    'source':   [{'type':'xsd:string', 'value':menu_button_svg}],
                    'language': [{'type':'xsd:string', 'value':'SVG'}],
                }),Snap(node=abc_icon_code, forw={
                    'name':     [{'type':'xsd:string', 'value':'Text Icon'}],
                    'source':   [{'type':'xsd:string', 'value':abc_svg}],
                    'language': [{'type':'xsd:string', 'value':'SVG'}],
                }),Snap(node=plus_icon_code, forw={
                    'name':     [{'type':'xsd:string', 'value':'Plus Icon'}],
                    'source':   [{'type':'xsd:string', 'value':plus_square_svg}],
                    'language': [{'type':'xsd:string', 'value':'SVG'}],
                }),Snap(node=code_icon_code, forw={
                    'name':     [{'type':'xsd:string', 'value':'Braces Icon'}],
                    'source':   [{'type':'xsd:string', 'value':braces_svg}],
                    'language': [{'type':'xsd:string', 'value':'SVG'}],
                }),Snap(node=icon_term, forw={
                    'name':     [{'type':'xsd:string', 'value':'Icon'}],
                    'type':     [{'type':'xsd:string', 'value':'Term'}],
                    'icon':     [code_icon_code],
                    'required': [code_stem],
                }),Snap(node=name_term, forw={
                    'name':     [{'type':'xsd:string', 'value':'Name'}],
                    'type':     [{'type':'xsd:string', 'value':'Term'}],
                    'icon':     [abc_icon_code],
                    'required': [{'type':'xsd:string', 'value':'String'}],
                    'make':     [{'type':'xsd:string', 'value':'New'}],
                }),Snap(node=context_term, forw={
                    'name':     [{'type':'xsd:string', 'value':'Context'}],
                    'type':     [{'type':'xsd:string', 'value':'Term'}],
                    'required': [{'type':'xsd:string', 'value':'String'}],
                    'add':      [delimit_leaf_node],
                }),Snap(node=make_term, forw={
                    'name':     [{'type':'xsd:string', 'value':'Make'}],
                    'type':     [{'type':'xsd:string', 'value':'Term'}],
                    'icon':     [plus_icon_code],
                }),Snap(node=add_term, forw={
                    'name':     [{'type':'xsd:string', 'value':'Add'}],
                    'type':     [{'type':'xsd:string', 'value':'Term'}],
                    'icon':     [plus_icon_code],
                }),Snap(node=minimum_term, forw={
                    'name':     [{'type':'xsd:string', 'value':'Minimum'}],
                    'type':     [term_type],
                }),Snap(node=maximum_term, forw={
                    'name':     [{'type':'xsd:string', 'value':'Maximum'}],
                    'type':     [term_type],
                }),Snap(node=code_term, forw={
                    'name':     [{'type':'xsd:string', 'value':'Code'}],
                    'type':     [{'type':'xsd:string', 'value':'Term'}],
                    'icon':     [code_icon_code],
                    'required': [code_stem],
                    'make':     [code_stem],
                }),Snap(node=required_term, forw={
                    'name':     [{'type':'xsd:string', 'value':'Required'}],
                    'type':     [{'type':'xsd:string', 'value':'Term'}],
                    'icon':     [type_icon_code],
                }),Snap(node=optional_term, forw={
                    'name':     [{'type':'xsd:string', 'value':'Optional'}],
                    'type':     [{'type':'xsd:string', 'value':'Term'}],
                    'icon':     [type_icon_code],
                }),Snap(node=pick_one_term, forw={
                    'name':     [{'type':'xsd:string', 'value':'Pick One'}],
                    'type':     [{'type':'xsd:string', 'value':'Term'}],
                    'icon':     [type_icon_code],
                }),Snap(node=one_or_more_term, forw={
                    'name':     [{'type':'xsd:string', 'value':'One or More'}],
                    'type':     [{'type':'xsd:string', 'value':'Term'}],
                    'icon':     [type_icon_code],
                }),Snap(node=root_type, forw={
                    'name':     [{'type':'xsd:string', 'value':'Root'}],
                    'icon':     [type_icon_code],
                    'required': [name_term],
                    'optional': [icon_term, required_term, optional_term, pick_one_term, one_or_more_term, make_term, code_term],
                }),Snap(node=term_type, forw={
                    'name':     [{'type':'xsd:string', 'value':'Term'}],
                    'icon':     [type_icon_code],
                    'required': [name_term],
                    'optional': [icon_term, required_term, optional_term, pick_one_term, one_or_more_term, make_term, add_term],
                }),Snap(node=stem_type, forw={
                    'name':     [{'type':'xsd:string', 'value':'Stem'}],
                    'icon':     [type_icon_code],
                    'required': [name_term, context_term],
                    'optional': [icon_term, minimum_term, maximum_term],
                }),Snap(node=delimit_context, forw={
                    'name':     [delimit_leaf_node],
                    'type':     [{'type':'xsd:string', 'value':'Context'}],
                    'types':    [root_type, term_type, stem_type],
                }),Snap(node=delimit_app, forw={
                    'name':        [delimit_leaf_node],
                    'type':        [{'type':'xsd:string', 'value':'App'}],
                    'delimit_app': [{'type':'xsd:boolean', 'value':True}],
                    'contexts':    [delimit_context],
                }),
            ])

            commit = Commit.objects.create(
                repo      = repo,
                committer = user,
                flex = {
                    'name': 'main',
                    'story': 'start',
                },
            )
            commit.authors.add(user)
            commit.snaps.set(snaps)

            return Make_Repo(reply = 'Make repo complete')
        except Exception as e: 
            print('Error: Make_Repo')
            print(e)
        return Make_Repo()


#snap_id = [make_id() for x in range(23)]
# id=snap_id.pop(), 


                    # 'user':{
                    #     user_obj.id: {'perm': 'read write'},
                    # },

            # Perm.objects.create(
            #     perm = make_id(),
            #     flex = {
            #         'actor': user.id,#{'type':'user', 'value':user.id}, 
            #         'asset': repo,#{'type':'repo', 'value':repo},
            #         'ability': 'all',
            #     },
            # )

            # branch = make_id()
            # Branch.objects.create(
            #     branch = branch,
            #     commit = commit,
            #     name   = 'main',
            # )


            # Node.objects.bulk_create([
            #     Node(commit=commit, node=delimit_leaf_node, forw=delimit_leaf_node),
            #     Node(commit=commit, node=code_stem, forw=code_stem),
            #     Node(commit=commit, node=type_icon_code, forw=type_icon_code),
            #     Node(commit=commit, node=abc_icon_code, forw=abc_icon_code),
            #     Node(commit=commit, node=plus_icon_code, forw=plus_icon_code),
            #     Node(commit=commit, node=code_icon_code, forw=code_icon_code),
            #     Node(commit=commit, node=name_term, forw=name_term),
            #     Node(commit=commit, node=context_term, forw=context_term),
            #     Node(commit=commit, node=icon_term, forw=icon_term),
            #     Node(commit=commit, node=required_term, forw=required_term),
            #     Node(commit=commit, node=optional_term, forw=optional_term),
            #     Node(commit=commit, node=pick_one_term, forw=pick_one_term),
            #     Node(commit=commit, node=one_or_more_term, forw=one_or_more_term),
            #     Node(commit=commit, node=add_term, forw=add_term),
            #     Node(commit=commit, node=make_term, forw=make_term),
            #     Node(commit=commit, node=minimum_term, forw=minimum_term),
            #     Node(commit=commit, node=maximum_term, forw=maximum_term),
            #     Node(commit=commit, node=code_term, forw=code_term),
            #     Node(commit=commit, node=root_type, forw=root_type),
            #     Node(commit=commit, node=term_type, forw=term_type),
            #     Node(commit=commit, node=stem_type, forw=stem_type),
            #     Node(commit=commit, node=delimit_context, forw=delimit_context),
            #     Node(commit=commit, node=delimit_app, forw=delimit_app),
            # ])





# delimit_string = make_id()
#             svg_string = make_id()
#             spec_icon_code_string = make_id()
#             icon_icon_code_string = make_id()
#             empty_string = make_id()
#             string_string = make_id()
#             tag_string = make_id()
#             name_string = make_id()
#             icon_string = make_id()
#             leaf_string = make_id()
#             make_string = make_id()
#             any_string = make_id()
#             all_string = make_id()
#             one_string = make_id()
#             spec_string = make_id()

#             spec_icon = make_id()
#             icon_icon = make_id()
#             spec_spec_tag = make_id()
#             spec_spec_name = make_id()
#             spec_spec_icon = make_id()
#             spec_spec_leaf = make_id()
#             spec_spec_make = make_id()
#             spec_spec_any = make_id()
#             spec_spec_all = make_id()
#             spec_spec_one = make_id()
#             spec_spec = make_id()

#             delimit_app = make_id()

#             (wq()
#                 .add_triple(delimit_string, '@schema:leaf', wq().string('delimit'))
#                 .add_triple(svg_string,    '@schema:leaf', wq().string('SVG'))
#                 .add_triple(spec_icon_code_string, '@schema:leaf', wq().string(menu_button_svg))
#                 .add_triple(icon_icon_code_string, '@schema:leaf', wq().string(braces_svg))
#                 .add_triple(empty_string,  '@schema:leaf', wq().string(''))
#                 .add_triple(string_string, '@schema:leaf', wq().string('String'))
#                 .add_triple(tag_string,    '@schema:leaf', wq().string('Tag'))
#                 .add_triple(name_string,   '@schema:leaf', wq().string('Name'))
#                 .add_triple(icon_string,   '@schema:leaf', wq().string('Icon'))
#                 .add_triple(leaf_string,   '@schema:leaf', wq().string('Leaf'))
#                 .add_triple(make_string,   '@schema:leaf', wq().string('Make'))
#                 .add_triple(any_string,    '@schema:leaf', wq().string('Any'))
#                 .add_triple(all_string,    '@schema:leaf', wq().string('All'))
#                 .add_triple(one_string,    '@schema:leaf', wq().string('One'))
#                 .add_triple(spec_string,   '@schema:leaf', wq().string('Spec'))

#                 .add_triple(spec_icon, '@schema:code', spec_icon_code_string)
#                 .add_triple(spec_icon, '@schema:language', svg_string)

#                 .add_triple(icon_icon, '@schema:code', icon_icon_code_string)
#                 .add_triple(icon_icon, '@schema:language', svg_string)
                
#                 .add_triple(spec_spec_tag, '@schema:tag',  tag_string)  
#                 .add_triple(spec_spec_tag, '@schema:leaf', string_string) 
#                 .add_triple(spec_spec_tag, '@schema:make', empty_string) # 'make' signifies to create a make stem when node created

#                 .add_triple(spec_spec_name, '@schema:term', name_string)  
#                 .add_triple(spec_spec_name, '@schema:leaf', string_string) 
#                 .add_triple(spec_spec_name, '@schema:make', empty_string) # 'make' signifies to create a make stem when node created
                
#                 .add_triple(spec_spec_icon, '@schema:term', icon_string)   
#                 .add_triple(spec_spec_icon, '@schema:icon', icon_icon) 
                
#                 .add_triple(spec_spec_leaf,  '@schema:term', leaf_string)  
#                 .add_triple(spec_spec_leaf,  '@schema:leaf', string_string) 

#                 .add_triple(spec_spec_make, '@schema:term', make_string)  
#                 #.add_triple(spec_spec_make, '@schema:icon', icon_icon) generic node icon? (box)

#                 .add_triple(spec_spec_any, '@schema:term', any_string)   
#                 .add_triple(spec_spec_any, '@schema:icon', spec_icon) 
                
#                 .add_triple(spec_spec_all, '@schema:term', all_string)   
#                 .add_triple(spec_spec_all, '@schema:icon', spec_icon) 
                
#                 .add_triple(spec_spec_one, '@schema:term', one_string)   
#                 .add_triple(spec_spec_one, '@schema:icon', spec_icon) 

#                 .add_triple(spec_spec, '@schema:tag',  spec_string)
#                 .add_triple(spec_spec, '@schema:name', spec_string)
#                 .add_triple(spec_spec, '@schema:icon', spec_icon)
#                 .add_triple(spec_spec, '@schema:all',  spec_spec_tag) # all means required
#                 .add_triple(spec_spec, '@schema:any',  spec_spec_name) # all means required
#                 .add_triple(spec_spec, '@schema:any',  spec_spec_icon)
#                 .add_triple(spec_spec, '@schema:any',  spec_spec_leaf)
#                 .add_triple(spec_spec, '@schema:any',  spec_spec_make)
#                 .add_triple(spec_spec, '@schema:any',  spec_spec_any)
#                 .add_triple(spec_spec, '@schema:any',  spec_spec_all)
#                 .add_triple(spec_spec, '@schema:any',  spec_spec_one)

#                 .add_triple(delimit_app, '@schema:delimit', wq().boolean(True))
#                 .add_triple(delimit_app, '@schema:name',  delimit_string)
#                 .add_triple(delimit_app, '@schema:specs', spec_spec)







                #     .add_triple(boolean_string,  '@schema:value', wq().String('Boolean'))
                # .add_triple(integer_string,  '@schema:value', wq().String('Integer'))
                # .add_triple(decimal_string,  '@schema:value', wq().String('Decimal'))

                # .add_triple(spec_spec, '@schema:any',  spec_spec_integer_leaf)
                # .add_triple(spec_spec, '@schema:any',  spec_spec_decimal_leaf)
                # .add_triple(spec_spec, '@schema:any',  spec_spec_string_leaf)

                # .add_triple(spec_spec_boolean_leaf, '@schema:name', leaf_string)  
                # .add_triple(spec_spec_boolean_leaf, '@schema:leaf', boolean_string) 

                # .add_triple(spec_spec_integer_leaf, '@schema:name', leaf_string)  
                # .add_triple(spec_spec_integer_leaf, '@schema:leaf', integer_string) 

                # .add_triple(spec_spec_decimal_leaf, '@schema:name', leaf_string)  
                # .add_triple(spec_spec_decimal_leaf, '@schema:leaf', decimal_string) 

# star_icon_svg = '''
# <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star" viewBox="0 0 16 16">
#   <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z"/>
# </svg>
# '''

# arrow_down_right_svg = '''
# <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down-right" viewBox="0 0 16 16">
#   <path fill-rule="evenodd" d="M14 13.5a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1 0-1h4.793L2.146 2.854a.5.5 0 1 1 .708-.708L13 12.293V7.5a.5.5 0 0 1 1 0v6z"/>
# </svg>
# '''


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



            # spec_spec = make_id()
            # type_name = make_id()
            # type_icon_code = make_id()
            # type_icon_code_code = make_id()
            # type_icon_code_language = make_id()

            # # stem type
            # stem_type = make_id()
            # stem_icon = make_id()
            # stem_icon_code = make_id()
            # stem_icon_language = make_id()

            # (wq()
            #     .add_triple(specSpec_name, '@schema:value', wq().String('Type'))

            #     .add_triple(spec_icon_code, '@schema:value', wq().String(spec_icon_code_value))

            #     .add_triple(spec_icon_language, '@schema:value', wq().String('SVG'))

            #     .add_triple(spec_icon, '@schema:code', spec_icon_code)
            #     .add_triple(spec_icon, '@schema:language', spec_icon_language)

            #     .add_triple(specSpec_stem_name, '@schema:name', specSpec_stem_name_name) 
            #     .add_triple(specSpec_stem_name, '@schema:icon', specSpec_stem_name_icon) 
            #     .add_triple(specSpec_stem_name, '@schema:leaf', specSpec_stem_name_leaf) # string node with value 'String'

            #     .add_triple(specSpec_stem_icon, '@schema:name', specSpec_stem_icon_name) 
            #     .add_triple(specSpec_stem_icon, '@schema:icon', specSpec_stem_icon_icon) 

            #     .add_triple(specSpec_stem_stem, '@schema:name', specSpec_stem_stem_name) # literally 'stem'
            #     .add_triple(specSpec_stem_stem, '@schema:icon', specSpec_stem_stem_icon) # '/' icon
                
            #     .add_triple(specSpec_stem_code, '@schema:name', specSpec_stem_code_name) 
            #     .add_triple(specSpec_stem_code, '@schema:icon', specSpec_stem_code_icon_code) 

            #     .add_triple(specSpec, '@schema:name', specSpec_name)
            #     .add_triple(specSpec, '@schema:icon', spec_icon)
            #     .add_triple(specSpec, '@schema:stem', specSpec_stem_name)
            #     .add_triple(specSpec, '@schema:stem', specSpec_stem_icon)
            #     .add_triple(specSpec, '@schema:stem', specSpec_stem_stem)
            #     .add_triple(specSpec, '@schema:stem', specSpec_stem_code)
                

            #     .add_triple(stemType, '@schema:name', stem_name)
            #     .add_triple(stemType, '@schema:icon', type_icon_code)
            #     .add_triple(stemType, '@schema:stem', type_stem_stem)
            #     .add_triple(stemType, '@schema:stem', type_stem_compute)
            #     .add_triple(stemType, '@schema:stem', type_stem_name)

            #     .add_triple('root', '@schema:type', specSpec)
            #     .add_triple('root', '@schema:type', stemType)