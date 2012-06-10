<?php
	
    require 'mailer.php';
    function receiveMail(){
       $server = '{imap.gmail.com:993/imap/ssl}INBOX';
       $user='requestengine@foiamachine.org';
       $pass='foiamachine';
       $mbox = imap_open( $server, $user, $pass ) or die ('Cannot connect to Gmail: ' . imap_last_error());
       $emails = imap_search($mbox, 'ALL');
       if($emails){
	  rsort($emails);
	  foreach($emails as $email_number){
	     $overview = imap_fetch_overview($mbox, $email_number, 0);
	     $message = imap_fetchbody($mbox, $email_number, 2);
	     $sub = $overview[0]->subject;
	     $from = $overview[0]->from;
	     $date = $overview[0]->date;
	     sendMail('requestengine@foiamachine.org', 'dummy.user@foiamachine.org', 'FOIA Machine', 'Dummy User', $sub, $message);
	  }
       }
    }

    receiveMail();
?>