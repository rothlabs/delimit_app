#import random
#import string
import os

#def new_id():
#    return ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(4))

def cax(path):
    return os.path.join(os.getcwd(),'../cax/'+path)