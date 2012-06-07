select
  countries.name as country,
  agencies.name as agency,
  topics.name as topic
from
  relations as r1,
  relations as r2,
  entities as countries,
  entities as agencies,
  entities as topics
where
  countries.id = r1.id1 and
  agencies.id = r1.id2 and
  r1.type = 2 and
  topics.id = r2.id1 and
  agencies.id = r2.id2 and
  r2.type = 3;
