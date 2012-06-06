<?php

    require_once "ezc/Base/src/base.php";
    function __autoload( $className )
    {
        ezcBase::autoload( $className );
    }

    function sendMail(){
       $mail = new ezcMailComposer();
       $mail->from = new ezcMailAddress( 'dummy.user@foiamachine.org', 'Dummy User' );
       $mail->addTo( new ezcMailAddress( 'requestengine@foiamachine.org', 'Request Engine' ) );
       $mail-> subject = "Hello foia, this is the subject";
       $mail->plainText = "I have been trying to reach for more than a week";
       $mail->build();
       $transport = new ezcMailMtaTransport();
       $transport->send($mail);
    }
    sendMail(); 
?>