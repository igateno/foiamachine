/*
 * The last part of the where clause could probably be simplified
 */
select
  countries.id as country_id,
  countries.name as country_name,
  agencies.id as agency_id,
  agencies.name as agency_name
from
  relations as r1,
  relations as r2,
  (select * from entities where type = 1) as countries,
  (select * from entities where type = 2) as agencies,
  (select * from entities where type = 3) as topics
where
  r1.id1 = countries.id and
  r1.id2 = agencies.id and
  r2.id1 = topics.id and
  r2.id2 = agencies.id and
  topics.id = :topic and
  countries.id in (
    select
      id
    from
      entities
    where
    id = :country or
    id in (select id1 from relations where id2 = :country)
  );
