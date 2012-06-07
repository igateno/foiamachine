<?php

    require_once "ezc/Base/src/base.php";
    function __autoload( $className )
    {
        ezcBase::autoload( $className );
    }

    function sendEMail($from_email, $to_email, $from_name, $to_name, $subject, $body){    
       $mail = new ezcMailComposer();
       $mail->from = new ezcMailAddress( $from_email, $from_name );
       $mail->addTo( new ezcMailAddress( $to_email, $to_name ) );
       $mail-> subject = $subject;
       $mail->plainText = $body;
       $mail->build();
       $transport = new ezcMailMtaTransport();
       $transport->send($mail);
    }

    function receiveMail(){
       $server = '{imap.gmail.com:993/imap/ssl}INBOX';
       $user='requestengine@foiamachine.org';
       $pass='foiamachine';
       $mbox = imap_open( $server, $user, $pass );
       $sorted_mbox = imap_sort($mbox, SORTDATE, 0);
       $totalrows = imap_num_msg($mbox);
       
       $five_minutes_earlier = time() - 5*60;
       $messagenum = 0;
       while ($messagenum < $totalrows) {
          $headers = imap_fetchheader($mbox, $sorted_mbox[ $messagenum ] );
          $subject = array();
          preg_match_all('/^Subject: (.*)/m', $headers, $subject);
          $sub = $subject[$messagenum + 1][0];
	  $body = imap_body($mbox, $messagenum + 1);
	  $header = imap_header($mbox, $messagenum + 1);                      
          if($header->udate > $five_minutes_earlier){
	      sendEmail('requestengine@foiamachine.org', 'dummy.user@foiamachine.org', 'FOIA Machine', 'Dummy User', $subject, $body);
	  }
          $messagenum++;
       }
    }

    receiveMail();
?>