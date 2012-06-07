select
  e1.name as name1,
  e2.name as name2
from
  relations as r1,
  entities as e1,
  entities as e2
where
  e1.id = r1.id1 and
  e2.id = r1.id2 and
  r1.type = 1;
