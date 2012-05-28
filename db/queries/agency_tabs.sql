/*
 * Country name and agency name of agencies related to Intelligence
 * in countries that know about the United States or are the United States
 * This needs to be submitted to some more thorough testing.
 */
select
  countries.name as country,
  agencies.name as agency
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
  topics.name = :topic and
  countries.id in (
    select
      id
    from
      entities
    where
    name = :country or
    id in (
      select id1 from relations where id2 in (
        select id from entities where name = :country
      )
    )
  );
