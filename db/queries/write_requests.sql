/*
 * This query requires that all agencies have an entry in the agency_data
 * table, otherwise they will not show up in the results.
 */
select
  l1.id,
  l1.question,
  date_format(l1.start_date, '%M %D, %Y') as start_date,
  date_format(l1.end_date, '%M %D, %Y') as end_date,
  date_format(l1.created, '%M %D, %Y') as created,
  e1.id as agency_id,
  e1.name as agency_name,
  ad1.contact_name as contact_name,
  ad1.template as template,
  e2.id as doctype_id,
  e2.name as doctype_name
from
  request_log as l1,
  entities as e1,
  request_log_agencies as a1,
  entities as e2,
  request_log_doctypes as d1,
  agency_data as ad1
where
  a1.request_log_id = l1.id and
  e1.id = a1.agency_id and
  d1.request_log_id = l1.id and
  e2.id = d1.doctype_id and
  ad1.agency_id = a1.agency_id and
  l1.id = :id;
