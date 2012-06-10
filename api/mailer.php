<?php

    require_once "ezc/Base/src/base.php";
    function __autoload( $className )
    {
        ezcBase::autoload( $className );
    }

    function sendMail($from, $to, $fromname, $toname, $subject, $body){    
       $mail = new ezcMailComposer();
       $mail->from = new ezcMailAddress( $from, $fromname );
       $mail->addTo( new ezcMailAddress( $to, $toname ) );
       $mail-> subject = $subject;
       $mail->plainText = $body;
       $mail->build();
       $transport = new ezcMailMtaTransport();
       $transport->send($mail);
    }
?>
