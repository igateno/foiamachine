select e1.name, r.type, e2.name
from entities as e1, entities as e2, relations as r
where e1.id = r.id1 and e2.id = r.id2;
