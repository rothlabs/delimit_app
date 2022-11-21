import random, string

def random_id():
    return ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(4))