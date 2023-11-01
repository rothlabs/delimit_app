import os

os.system("""terminusdb migration admin/delimit --operations '[{ "@type" : "MoveClass", "from" : "Person", "to" : "User" }]'""")