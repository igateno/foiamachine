<?php

    require_once "ezc/Base/src/base.php";
    function __autoload( $className )
    {
        ezcBase::autoload( $className );
    }

    function sendMail(){    
       $mail = new ezcMailComposer();
       $mail->from = new ezcMailAddress( 'requestengine@foiamachine.org', 'FOIA Machine Request Engine' );
       $mail->addTo( new ezcMailAddress( 'dummy.agency@foiamachine.org', 'Dummy Agency' ) );
       //$mail->addCc( new ezcMailAddress( 'dummy.user@foiamachine.org', 'Dummy User' ) );
       $mail-> subject = "Hello foia, this is the subject";
       $mail->plainText = "I have been trying to reach for more than a week";
       $mail->build();
       $transport = new ezcMailMtaTransport();
       $transport->send($mail);
    }

    function getConnection(){
    	$dbhost = "mysql.foiamachine.org";
     	$dbuser = "foia";
     	$dbpassphrase = "foiamachine";
     	$dbname = "foiastagingdb";
     	$dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser,
          $dbpassphrase);
     	$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
     	return $dbh;
    }

    sendMail(); 
?>
