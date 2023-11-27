import re
import graphene
from graph.database import gdbc, gdb_connect
from core.api.config import auth_required_message
from terminus import WOQLQuery as wq # terminusdb_client
from core.api.util import conform, make_id
from core.models import Repo

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

abc_svg = '''<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-alphabet-uppercase" viewBox="0 0 16 16">
  <path d="M1.226 10.88H0l2.056-6.26h1.42l2.047 6.26h-1.29l-.48-1.61H1.707l-.48 1.61ZM2.76 5.818h-.054l-.75 2.532H3.51zm3.217 5.062V4.62h2.56c1.09 0 1.808.582 1.808 1.54 0 .762-.444 1.22-1.05 1.372v.055c.736.074 1.365.587 1.365 1.528 0 1.119-.89 1.766-2.133 1.766h-2.55ZM7.18 5.55v1.675h.8c.812 0 1.171-.308 1.171-.853 0-.51-.328-.822-.898-.822zm0 2.537V9.95h.903c.951 0 1.342-.312 1.342-.909 0-.591-.382-.954-1.095-.954H7.18Zm5.089-.711v.775c0 1.156.49 1.803 1.347 1.803.705 0 1.163-.454 1.212-1.096H16v.12C15.942 10.173 14.95 11 13.607 11c-1.648 0-2.573-1.073-2.573-2.849v-.78c0-1.775.934-2.871 2.573-2.871 1.347 0 2.34.849 2.393 2.087v.115h-1.172c-.05-.665-.516-1.156-1.212-1.156-.849 0-1.347.67-1.347 1.83Z"/>
</svg>'''

class Make_Repo(graphene.Mutation):
    class Arguments:
        team = graphene.String()
        name = graphene.String()
        description = graphene.String()
    reply = graphene.String(default_value = 'Failed to make repo')
    @classmethod
    def mutate(cls, root, info, team, name, description):
        try:
            user = info.context.user
            if not user.is_authenticated:
                return Make_Repo(reply = auth_required_message)
            team, gdb_user = gdb_connect(user, team=team)
            name = conform(name, max_length=64, name=True)
            repo = make_id() 
            description = conform(description, max_length=512)
            #prefixes = {'@base' : 'iri:///'+repo+'/', '@schema':'iri:///'+repo+'#'} # iri prefix needs to be the same for every database for cross coms?! #1
            gdbc.create_database(
                repo, # name
                team, 
                label = name,
                description = description, # comment
                #prefixes = prefixes,
                include_schema = False,
            )
            Repo.objects.create(
                repo = repo,
                team = team,
                name = name,
                description = description,
            )
            gdbc.set_db(repo, team)

            #string_string = make_id()
            #icon_language = make_id()
            #type_string = make_id()
            
            type_icon_code = make_id()
            abc_icon_code  = make_id()
            make_icon_code = make_id()
            code_icon_code = make_id()

            icon_term = make_id()

            term_term = make_id()
            stem_term = make_id()
            make_term = make_id()
            expect_term = make_id()

            name_term = make_id()
            type_term = make_id()
            required_term = make_id()
            optional_term = make_id()
            separate_term = make_id()
            code_term     = make_id()

            #name_term_type_edge = make_id()

            term_type = make_id()
            type_type = make_id()
            delimit_root = make_id()

            (wq() 
                #.add_triple(string_string, '@schema:leaf', wq().string('String'))
                #.add_triple(icon_language,  '@schema:leaf', wq().string('SVG'))
                #.add_triple(type_string,   '@schema:leaf', wq().string('type'))

                .add_triple(type_icon_code, '@schema:name',     wq().string('Type Icon'))
                .add_triple(type_icon_code, '@schema:type',     wq().string('Code'))
                .add_triple(type_icon_code, '@schema:code',     wq().string(menu_button_svg))
                .add_triple(type_icon_code, '@schema:language', wq().string('SVG'))

                .add_triple(abc_icon_code, '@schema:name',     wq().string('Term Icon'))
                .add_triple(abc_icon_code, '@schema:type',     wq().string('Code'))
                .add_triple(abc_icon_code, '@schema:code',     wq().string(abc_svg))
                .add_triple(abc_icon_code, '@schema:language', wq().string('SVG'))

                .add_triple(make_icon_code, '@schema:name',     wq().string('Make Icon'))
                .add_triple(make_icon_code, '@schema:type',     wq().string('Code'))
                .add_triple(make_icon_code, '@schema:code',     wq().string(plus_square_svg))
                .add_triple(make_icon_code, '@schema:language', wq().string('SVG'))

                .add_triple(code_icon_code, '@schema:name',     wq().string('Code Icon'))
                .add_triple(code_icon_code, '@schema:type',     wq().string('Code'))
                .add_triple(code_icon_code, '@schema:code',     wq().string(braces_svg))
                .add_triple(code_icon_code, '@schema:language', wq().string('SVG'))
                
                # .add_triple(type_type_tag, '@schema:term', wq().string('Tag'))  
                # .add_triple(type_type_tag, '@schema:leaf', wq().string('String')) 
                # .add_triple(type_type_tag, '@schema:make', wq().string('')) # 'make' signifies to create a make stem when node created

                .add_triple(name_term, '@schema:name',   wq().string('Name'))  
                .add_triple(name_term, '@schema:type',   wq().string('Term Type')) 
                .add_triple(name_term, '@schema:icon',   abc_icon_code) 
                #.add_triple(name_term, '@schema:term',   wq().string('Name'))   
                .add_triple(name_term, '@schema:make',   wq().string('')) # 'make' signifies to create a make stem when node created
                .add_triple(name_term, '@schema:expect', wq().string('String'))

                # .add_triple(name_term_type_edge, '@schema:type', wq().string('type'))
                # .add_triple(name_term_type_edge, '@schema:term', wq().string('Required'))  
                # .add_triple(name_term_type_edge, '@schema:stem', name_term_type) 
                
                .add_triple(icon_term, '@schema:name',   wq().string('Icon'))  
                .add_triple(icon_term, '@schema:type',   wq().string('Term Type')) 
                .add_triple(icon_term, '@schema:icon',   code_icon_code) 
                #.add_triple(icon_term, '@schema:term',   wq().string('Icon')) 
                .add_triple(icon_term, '@schema:expect', wq().string('Code'))  

                # .add_triple(term_term, '@schema:name',   wq().string('Term'))   
                # .add_triple(term_term, '@schema:type',   wq().string('Term')) 
                # .add_triple(term_term, '@schema:icon',   abc_icon_code)   
                # .add_triple(term_term, '@schema:term',   wq().string('Term'))   
                # .add_triple(term_term, '@schema:expect', wq().string('String')) 

                # .add_triple(type_type_leaf,  '@schema:term', wq().string('Leaf')) 
                # .add_triple(type_type_leaf,  '@schema:expect', wq().string('String'))  
                # .add_triple(type_type_leaf,  '@schema:pick', wq().string('Boolean')) 
                # .add_triple(type_type_leaf,  '@schema:pick', wq().string('Integer')) 
                # .add_triple(type_type_leaf,  '@schema:pick', wq().string('Decimal')) 
                # .add_triple(type_type_leaf,  '@schema:pick', wq().string('String')) 

                .add_triple(make_term, '@schema:name', wq().string('Make'))   
                .add_triple(make_term, '@schema:type', wq().string('Term Type')) 
                .add_triple(make_term, '@schema:icon', make_icon_code) 
                #.add_triple(make_term, '@schema:term', wq().string('Make'))  

                .add_triple(stem_term, '@schema:name', wq().string('Stem'))   
                .add_triple(stem_term, '@schema:type', wq().string('Term Type')) 
                #.add_triple(stem_term, '@schema:term', wq().string('Stem')) 

                .add_triple(expect_term, '@schema:name',   wq().string('Expect'))   
                .add_triple(expect_term, '@schema:type',   wq().string('Term Type')) 
                #.add_triple(expect_term, '@schema:term',   wq().string('Expect'))  # list of type names
                #.add_triple(expect_term, '@schema:expect', wq().string('String')) 

                .add_triple(code_term, '@schema:name',   wq().string('Code'))   
                .add_triple(code_term, '@schema:type',   wq().string('Term Type'))
                .add_triple(code_term, '@schema:icon',   code_icon_code)
                #.add_triple(code_term, '@schema:term',   wq().string('Code'))  
                .add_triple(code_term, '@schema:expect', wq().string('Code')) # type name

                .add_triple(required_term, '@schema:name', wq().string('Required'))
                .add_triple(required_term, '@schema:type', wq().string('Term Type'))
                .add_triple(required_term, '@schema:icon', type_icon_code) 
                #.add_triple(required_term, '@schema:term', wq().string('Required'))   
                .add_triple(required_term, '@schema:stem', name_term) 
                .add_triple(required_term, '@schema:expect', wq().string('Node Type'))
                .add_triple(required_term, '@schema:expect', wq().string('Term Type'))

                .add_triple(optional_term, '@schema:name', wq().string('Optional'))
                .add_triple(optional_term, '@schema:type', wq().string('Term Type'))
                .add_triple(optional_term, '@schema:icon', type_icon_code) 
                #.add_triple(optional_term, '@schema:term', wq().string('Optional'))
                
                .add_triple(separate_term, '@schema:name', wq().string('Separate'))
                .add_triple(separate_term, '@schema:type', wq().string('Term Type'))
                .add_triple(separate_term, '@schema:icon', type_icon_code) 
                #.add_triple(separate_term, '@schema:term', wq().string('Separate'))   

                .add_triple(type_type, '@schema:name', wq().string('Node')) # node type
                #.add_triple(type_type, '@schema:type', wq().string('Type'))
                .add_triple(type_type, '@schema:icon', type_icon_code)
                #.add_triple(type_type, '@schema:required', type_term)
                .add_triple(type_type, '@schema:required', name_term) 
                .add_triple(type_type, '@schema:optional', icon_term)
                .add_triple(type_type, '@schema:optional', required_term)
                .add_triple(type_type, '@schema:optional', optional_term)
                .add_triple(type_type, '@schema:optional', separate_term)
                .add_triple(type_type, '@schema:optional', code_term)

                .add_triple(term_type, '@schema:name', wq().string('Term'))
                #.add_triple(term_type, '@schema:type', wq().string('Type'))
                .add_triple(term_type, '@schema:icon', type_icon_code)
                #.add_triple(term_type, '@schema:required', type_term)
                #.add_triple(term_type, '@schema:required', term_term)
                .add_triple(term_type, '@schema:required', name_term) 
                .add_triple(term_type, '@schema:optional', icon_term)
                .add_triple(term_type, '@schema:optional', stem_term)
                .add_triple(term_type, '@schema:optional', make_term)
                .add_triple(term_type, '@schema:optional', required_term)
                .add_triple(term_type, '@schema:optional', optional_term)
                .add_triple(term_type, '@schema:optional', separate_term)
                #.add_triple(term_type, '@schema:optional', expect_term)

                .add_triple(term_type, '@schema:name', wq().string('Stem'))

                .add_triple(delimit_root, '@schema:delimit', wq().boolean(True))
                .add_triple(delimit_root, '@schema:name',  wq().string('delimit'))
                .add_triple(delimit_root, '@schema:types', node)
                .add_triple(delimit_root, '@schema:types', term)
                .add_triple(delimit_root, '@schema:types', stem)
            ).execute(gdbc)

            return Make_Repo(reply = 'Made repo')
        except Exception as e: 
            print('Error: Make_Repo')
            print(e)
        return Make_Repo()










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

#             delimit_root = make_id()

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

#                 .add_triple(delimit_root, '@schema:delimit', wq().boolean(True))
#                 .add_triple(delimit_root, '@schema:name',  delimit_string)
#                 .add_triple(delimit_root, '@schema:specs', spec_spec)







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