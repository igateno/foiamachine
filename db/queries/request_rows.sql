select
  rl.id as id,
  e1.name as country,
  e2.name as topic,
  rl.question as question
from
  request_log as rl,
  entities as e1,
  entities as e2
where
  e1.id = rl.country_id and
  e2.id = rl.topic_id and
  rl.user_id = :id;
