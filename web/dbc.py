import os

os.system("""terminusdb migration admin/delimit --operations '[{ "@type" : "MoveClass", "from" : "Person", "to" : "User" }]'""")

os.system("""terminusdb migration admin/delimit --operations '[{ "@type" : "CastClassProperty", "class" : "Asset", "property" : "drop", "type" : "xsd:boolean", "default" : { "@type" : "Default", "value" : "False" }}]'""")