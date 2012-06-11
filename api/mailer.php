<?php
  
    /* adapted fro http://sb2.info/php-script-html-plain-text-convert */
    function html2text($html)
    {
	$tags = array (
   	       0 => '~<h[123][^>]+>~si',
	       1 => '~<h[456][^>]+>~si',
  	       2 => '~<table[^>]+>~si',
    	       3 => '~<tr[^>]+>~si',
    	       4 => '~<li[^>]+>~si',
    	       5 => '~<br[^>]+>~si',
    	       6 => '~<p[^>]+>~si',
	       7 => '~<div[^>]+>~si',
    	       );
	 
	 $html = preg_replace($tags,"\n",$html);
	 $html = preg_replace('~</t(d|h)>\s*<t(d|h)[^>]+>~si',' - ',$html);
    	 $html = preg_replace('~<[^>]+>~s','',$html);
    
	 // reducing spaces
    	 $html = preg_replace('~ +~s',' ',$html);
    	 $html = preg_replace('~^\s+~m','',$html);
    	 $html = preg_replace('~\s+$~m','',$html);
    	 
	 // reducing newlines
    	 $html = preg_replace('~\n+~s',"\n",$html);
    	 return $html;
    }

    function sendMail($from, $to, $subject, $body){  
    	$headers = 'From: requestengine@foiamachine.org' . "\r\n" .
    		   'Reply-To: requestengine@foiamachine.org' . "\r\n" .
		   'X-Mailer: PHP/' . phpversion();
	mail($to, $subject, html2text($body), $headers);
    }
