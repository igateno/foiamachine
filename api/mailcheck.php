<?php
    function receiveMail(){
       $server = '{imap.gmail.com:993/imap/ssl}INBOX';
       $user='requestengine@foiamachine.org';
       $pass='foiamachine';
       $mbox = imap_open( $server, $user, $pass );
       $sorted_mbox = imap_sort($mbox, SORTDATE, 0);
       $totalrows = imap_num_msg($mbox);
       
       print "<b>". $totalrows . " messages</b> <br></br>";
       $startvalue = 0;
       while ($startvalue < $totalrows) {
          $headers = imap_fetchheader($mbox, $sorted_mbox[ $startvalue ] );
          $subject = array();
          preg_match_all('/^Subject: (.*)/m', $headers, $subject);
          print $startvalue + 1 . " " . $subject[1][0] . "<br></br>";
          $startvalue++;
       }
    } 
?>