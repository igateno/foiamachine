select
  re.id as id,
  e1.name as agency,
  re.subject as subject,
  re.body as body,
  re.outgoing as outgoing,
  date_format(re.timestamp, '%M %D, %Y') as date
from
  request_log as rl,
  request_emails as re,
  entities as e1
where
  e1.id = re.agency_id and
  rl.id = re.request_log_id and
  rl.id = :request_log_id;
