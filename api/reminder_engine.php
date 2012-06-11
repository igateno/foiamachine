<?php

     function sendReminders(){
     	$sql = "select AD.email, E.name as aname, RE.subject, RE.body from request_log R, request_emails RE, entities E, agency_data AD, request_reminders RR where R.agency_id = E.id and R.agency_id = AD.id and R.id = RE.request_log_id and RR.request_log_id = R.id and RR.next_send_date <= CURRENT_TIMESTAMP";

	try {
     	    $db = getConnection();
	    $stmt = $db->prepare($sql);
      	    $stmt->execute();
	    $entities = $stmt->fetchAll(PDO::FETCH_OBJ);
	    foreach($entities as $row){
	        $sub = $row['subject'];
		$to = $row['email'];
		$to_name = $row['aname'];
		$body = $row['body'];
		sendMail('requestengine@foiamachine.org', $to, 'FOIA Machine', $to_name, $sub, $body);
	    }
      	    $db = null;
    	} catch (PDOException $e) {
      	    echo '{"error":{"text":'.$e->getMessage().'}}';
	}
     }
?>