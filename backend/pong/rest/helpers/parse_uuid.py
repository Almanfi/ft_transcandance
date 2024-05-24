import uuid
from typing import List

def parse_uuid(keys_list:List[str]):
    uuid_list = list()
    for id in keys_list:
        try :
            uuid_list.append(uuid.UUID(id))
        except ValueError:
            uuid_list.append(None)
        finally:
            continue
    return uuid_list