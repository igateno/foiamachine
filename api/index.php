<?php
  require 'Slim/Slim/Slim.php';
  require 'dbconnect.php';
  require 'mailer.php';

  //////////////////////////////////////////////////////////////////////////
  //
  // App Instantiation and Routes
  //
  /////////////////////////////////////////////////////////////////////////

  $app = new Slim();

  // Auth
  $app->post('/auth', 'register');
  $app->put('/auth', 'login');

  // Entities
  $app->get('/entities', 'getEntities');
  $app->get('/entities/type/:type', 'getEntitiesByType');
  $app->post('/entities', 'addEntity');

  $app->get('/countries', 'getCountries');
  $app->get('/agencies', 'getAgencies');
  $app->post('/agencies', 'addAgency');
  $app->get('/topics', 'getTopics');
  $app->get('/doctypes', 'getDoctypes');

  // Relations
  $app->post('/ccRelations', 'addCCRelation');

  // Entities and Relations tables
  $app->post('/agencyTabs', 'agencyTabs');
  $app->post('/requestPreviews', 'requestPreviews');

  // Request Log
  $app->post('/requestLog', 'addRequestLog');
  $app->post('/requestRows', 'getRequestRows');

  // Request Emails
  $app->post('/requestEmails', 'addRequestEmail');
  $app->post('/viewRequest', 'getRequestEmails');

  $app->run();

  //////////////////////////////////////////////////////////////////////////
  //
  // Authentication
  //
  /////////////////////////////////////////////////////////////////////////

  function userLookup($name) {
    $sql = "select id, hash, salt from users where name=:username";

    try {
      $db = getConnection();
      $stmt = $db->prepare($sql);
      $stmt->bindParam("username",$name);
      $stmt->execute();
      $auth = $stmt->fetchObject();
      $db = null;
    } catch (PDOException $e) {
      // TODO log this error message
      // echo '{"error":{"text":'.$e->getMessage().'}}';
      return null;
    }

    return $auth;
  }

  function validateToken() {
    $request = Slim::getInstance()->request();
    $params = json_decode($request->getBody());

    try {
      $rslt = userLookup($params->username);
    } catch (PDOException $e) {
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error":{"text":'.$e->getMessage().'}}';
      return false;
    }

    if (!$rslt) return null;

    $rslt_token = hash('sha256', $rslt->id.$rslt->salt.date("z"));
    if (strcmp($params->token, $rslt_token)) {
      return null;
    } else {
      return $rslt->id;
    }
  }

  function echoToken($id, $salt) {
    $token = hash('sha256', $id.$salt.date("z"));
    echo '{"token":"'.$token.'"}';
  }

  function echoError($errstr) {
    header('HTTP/1.0 420 Enhance Your Calm', true, 420);
    echo '{"error":"'.$errstr.'","token":""}';
  }

  function login(){
    $request = Slim::getInstance()->request();
    $params = json_decode($request->getBody());

    $rslt = userLookup($params->username);
    if (!$rslt) {
      echoError('Username does not exist.');
      return;
    }

    $user_hash = hash('sha256', $params->password.$rslt->salt);
    if (strcmp($user_hash, $rslt->hash)) {
      echoError('Your password is incorrect.');
    } else {
      echoToken($rslt->id, $rslt->salt);
    }
  }

  function register() {
    $request = Slim::getInstance()->request();
    $params = json_decode($request->getBody());

    $existing = userLookup($params->username);
    if ($existing) {
      echoError('Username already in use.');
      return;
    }

    // strcmp returns 0 if there is a match
    // nonzero will trigger the error
    if (strcmp($params->code, 'cs194foia12')) {
      echoError('Wrong access code.');
      return;
    }

    // TODO
    // - check that email is not already in use
    // - check that email is valid
    // - send confirmation email and have a way to receive response

    $salt = hash('sha256', uniqid(mt_rand(),true));
    $hash = hash('sha256', $params->password.$salt);
    $sql = "insert into users (name, email, hash, salt, type)".
           "values (:name, :email, :hash, :salt, 1)";

    try {
      $db = getConnection();
      $stmt = $db->prepare($sql);
      $stmt->bindParam("name", $params->username);
      $stmt->bindParam("email", $params->email);
      $stmt->bindParam("hash", $hash);
      $stmt->bindParam("salt", $salt);
      $stmt->execute();
      $id = $db->lastInsertId();
      $db = null;
      echoToken($id, $salt);
    } catch (PDOException $e) {
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error":{"text":'.$e->getMessage().'}}';
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  // Entities
  //
  /////////////////////////////////////////////////////////////////////////

  function getEntities(){
     $sql = "select * from entities order by name";
     try{
        $db = getConnection();
        $stmt = $db->query($sql);
        $entities = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo json_encode($entities);
     }catch(PDOException $e){
        header('HTTP/1.0 420 Enhance Your Calm', true, 420);
        echo '{"error":{"text":'.$e->getMessage().'}}';
     }
  }

  function getEntitiesByType($type){
    $sql = "select * from entities where type = :type";
    try {
      $db = getConnection();
      $stmt = $db->prepare($sql);
      $stmt->bindParam('type', $type);
      $stmt->execute();
      $entities = $stmt->fetchAll(PDO::FETCH_OBJ);
      $db = null;
      echo json_encode($entities);
    } catch (PDOException $e) {
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error":{"text":'.$e->getMessage().'}}';
    }
  }

  function getCountries() {
    getEntitiesByType(1);
  }

  function getAgencies() {
    getEntitiesByType(2);
  }

  function getTopics() {
    getEntitiesByType(3);
  }

  function getDoctypes() {
    getEntitiesByType(4);
  }

  function addEntityQuery($params) {
    $sql = "insert into entities (name, type) values(:name, :type)";
    try{
      $db = getConnection();
      $stmt = $db->prepare($sql);
      $stmt->bindParam("name", $params->name);
      $stmt->bindParam("type", $params->type);
      $stmt->execute();
      $id = $db->lastInsertId();
      $db = null;
      return $id;
    }catch(PDOException $e){
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error":{"text":'.$e->getMessage().'}}';
      return null;
    }
  }

  function addEntity(){
    $id = validateToken();
    if (!$id) {
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error": "invalid token"}';
      return;
    }

    $request = Slim::getInstance()->request();
    $params = json_decode($request->getBody());

    $params->id = addEntityQuery($params);

    if ($params->id) {
      echo json_encode($params);
    }
  }

  function addAgency() {
    $id = validateToken();
    if (!$id) {
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error": "invalid token"}';
      return;
    }

    $request = Slim::getInstance()->request();
    $params = json_decode($request->getBody());

    $sql1 = 'insert into entities (name, type) values (:name, 2)';
    $sql2 = 'insert into relations (id1, id2, type) values'.
            '(:cid, :aid, 2), (:tid, :aid, 3)';
    $sql3 = 'insert into agency_data (agency_id, contact_name, email) values'.
            '(:aid, :contact, :email)';

    $db = getConnection();
    $db->beginTransaction();
    try {
      $stmt = $db->prepare($sql1);
      $stmt->bindParam('name', $params->agency_name);
      $stmt->execute();
      $params->agency_id = $db->lastInsertId();

      $stmt = $db->prepare($sql2);
      $stmt->bindParam('cid', $params->country_id);
      $stmt->bindParam('aid', $params->agency_id);
      $stmt->bindParam('tid', $params->topic_id);
      $stmt->execute();

      $stmt = $db->prepare($sql3);
      $stmt->bindParam('aid', $params->agency_id);
      $stmt->bindParam('contact', $params->contact_name);
      $stmt->bindParam('email', $params->email);
      $stmt->execute();

      $db->commit();
      echo json_encode($params);
    } catch (PDOException $e) {
      $db->rollBack();
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error":{"text":'.$e->getMessage().'}}';
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  // Relations
  //
  /////////////////////////////////////////////////////////////////////////

  function getCCRelations(){
     $sql = file_get_contents('../db/queries/ccrelations.sql');

     try{
        $db = getConnection();
        $stmt = $db->query($sql);
        $relations = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo json_encode($relations);
     }catch(PDOException $e){
        header('HTTP/1.0 420 Enhance Your Calm', true, 420);
        echo '{"error":{"text":'.$e->getMessage().'}}';
     }
  }

  function addCCRelation(){
    $id = validateToken();
    if (!$id) {
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error": "invalid token"}';
      return;
    }

    $request = Slim::getInstance()->request();
    $params = json_decode($request->getBody());

    $sql = "insert into relations (id1, id2, type) values(:id1, :id2, :type)";
    try{
      $db = getConnection();
      $stmt = $db->prepare($sql);
      $stmt->bindParam("id1", $params->id1);
      $stmt->bindParam("id2", $params->id2);
      $stmt->bindParam("type", $params->type);
      $stmt->execute();
      $db = null;
      echo '{"status":"ok"}';
    }catch(PDOException $e){
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error":{"text":'.$e->getMessage().'}}';
    }
  }

  function getCATRelations() {
    $sql = file_get_contents('../db/queries/catrelations.sql');
    try{
      $db = getConnection();
      $stmt = $db->query($sql);
      $relations = $stmt->fetchAll(PDO::FETCH_OBJ);
      $db = null;
      echo json_encode($relations);
    }catch(PDOException $e){
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error":{"text":'.$e->getMessage().'}}';
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  // Entities and Requests
  //
  // The functions below use the entities and relations tables to populate
  // the agencies suggested to the user during the request composition
  // process and then the previews of requests made by the user.
  //
  /////////////////////////////////////////////////////////////////////////

  function agencyTabsQuery() {
    $request = Slim::getInstance()->request();
    $params = json_decode($request->getBody());
    $results = null;

    $sql = file_get_contents('../db/queries/agency_tabs.sql');
    try {
      $db = getConnection();
      $stmt = $db->prepare($sql);
      $stmt->bindParam('country', $params->country);
      $stmt->bindParam('topic', $params->topic);
      $stmt->execute();
      $results = $stmt->fetchAll(PDO::FETCH_OBJ);
      $db = null;
    } catch (PDOException $e) {
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error":{"text":'.$e->getMessage().'}}';
    }

    return $results;
  }

  function agencyTabs() {
    /*if (!validateToken()) {
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error": "invalid token"}';
      return;
    }*/

    $results = agencyTabsQuery();

    if (!$results) {
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error":"Database query returned no results in agencyTabs."}';
    } else {
      $tabs = array();
      foreach ($results as $result) {
        $id = $result->country_id;
        if (!array_key_exists($id, $tabs)) {
          $tabs[$id] = array();
          $tabs[$id]['name'] = $result->country_name;
          $tabs[$id]['agencies'] = array();
        }
        $tabs[$id]['agencies'][$result->agency_id] = $result->agency_name;
      }

      echo json_encode($tabs);
    }
  }

  function requestPreviewsQuery() {
    $request = Slim::getInstance()->request();
    $params = json_decode($request->getBody());
    $results = null;

    $sql = file_get_contents('../db/queries/write_requests.sql');
    try {
      $db = getConnection();
      $stmt = $db->prepare($sql);
      $stmt->bindParam('id', $params->id);
      $stmt->execute();
      $results = $stmt->fetchAll(PDO::FETCH_OBJ);
      $db = null;
    } catch (PDOException $e) {
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error":{"text":'.$e->getMessage().'}}';
    }

    return $results;
  }

  function requestPreviews() {
    $id = validateToken();
    if (!$id) {
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error": "invalid token"}';
      return;
    }

    $results = requestPreviewsQuery();

    if (!$results) {
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error":"Database query produced no results in requestPreviews."}';
    } else {
      $previews = array();
      $previews['agencies'] = array();
      $previews['doctypes'] = array();
      foreach ($results as $result) {
        if (!array_key_exists('question', $previews))
          $previews['question'] = $result->question;
        if (!array_key_exists('start_date', $previews))
          $previews['start_date'] = $result->start_date;
        if (!array_key_exists('end_date', $previews))
          $previews['end_date'] = $result->end_date;
        if (!array_key_exists('created', $previews))
          $previews['created'] = $result->created;
        if (!array_key_exists($result->agency_id, $previews['agencies'])) {
          $previews['agencies'][$result->agency_id]['agency_name'] = $result->agency_name;
          $previews['agencies'][$result->agency_id]['contact_name'] = $result->contact_name;
          $previews['agencies'][$result->agency_id]['template'] = $result->template;
        }
        if (!array_key_exists($result->doctype_id, $previews['doctypes']))
          $previews['doctypes'][$result->doctype_id] = $result->doctype_name;
      }

      echo json_encode($previews);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  // Request Log
  //
  /////////////////////////////////////////////////////////////////////////

  function addRequestLog() {
    $id = validateToken();
    if (!$id) {
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error": "invalid token"}';
      return;
    }

    $request = Slim::getInstance()->request();
    $params = json_decode($request->getBody());

    $sql1 = 'insert into request_log'.
           '(user_id, country_id, topic_id, start_date, end_date, question)'.
           'values'.
           '(:user_id, :country_id, :topic_id, :start_date, :end_date, :question)';
    $sql2 = 'insert into request_log_agencies (request_log_id, agency_id)'.
           'values (:request_log_id, :agency_id)';
    $sql3 = 'insert into request_log_doctypes (request_log_id, doctype_id)'.
           'values (:request_log_id, :doctype_id)';

    $db = getConnection();
    $db->beginTransaction();
    try{
      $stmt = $db->prepare($sql1);
      $stmt->bindParam('user_id', $id);
      $stmt->bindParam('country_id', $params->country);
      $stmt->bindParam('topic_id', $params->topic);
      $stmt->bindParam('start_date', $params->start);
      $stmt->bindParam('end_date', $params->end);
      $stmt->bindParam('question', $params->question);
      $stmt->execute();
      $params->id = $db->lastInsertId();

      foreach($params->agency_ids as $aid) {
        $stmt = $db->prepare($sql2);
        $stmt->bindParam('request_log_id', $params->id);
        $stmt->bindParam('agency_id', $aid);
        $stmt->execute();
      }

      foreach($params->doctype_ids as $did) {
        $stmt = $db->prepare($sql3);
        $stmt->bindParam('request_log_id', $params->id);
        $stmt->bindParam('doctype_id', $did);
        $stmt->execute();
      }

      $db->commit();
      echo json_encode($params);
    }catch(PDOException $e){
      $db->rollback();
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error":{"text":'.$e->getMessage().'}}';
    }
  }

  function getRequestRows() {
    $id = validateToken();
    if (!$id) {
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error": "invalid token"}';
      return;
    }

    $request = Slim::getInstance()->request();
    $params = json_decode($request->getBody());

    $sql = file_get_contents('../db/queries/request_rows.sql');

    try {
      $db = getConnection();
      $stmt = $db->prepare($sql);
      $stmt->bindParam('id', $id);
      $stmt->execute();
      $results = $stmt->fetchAll(PDO::FETCH_OBJ);
      echo json_encode($results);
    } catch (PDOException $e) {
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error":{"text":'.$e->getMessage().'}}';
    }
  }
  //////////////////////////////////////////////////////////////////////////
  //
  // Request Emails
  //
  /////////////////////////////////////////////////////////////////////////

  // TODO this should trigger the actual sending of an email
  function addRequestEmail(){
    $id = validateToken();
    if (!$id) {
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error": "invalid token"}';
      return;
    }

    $request = Slim::getInstance()->request();
    $params = json_decode($request->getBody());

    $timestamp = date('Y-m-d H:i:s');

    $sql1 = 'insert into request_emails'.
            '(request_log_id, agency_id, subject, body, outgoing)'.
            'values'.
            '(:request_log_id, :agency_id, :subject, :body, :outgoing)';
    $sql2 = 'insert into request_reminders (request_log_id, next_send_date)'.
            'values (:request_log_id, :next_send_date)';

	$sql3 = 'update request_log set approved = 1 where id = :request_log_id';

	$subject = $params->subject .' [foiaid:'.$params->request_log_id.'-'.$params->agency_id.']';

    $db = getConnection();
    $db->beginTransaction();
    try {
      $stmt = $db->prepare($sql1);
      $stmt->bindParam('request_log_id', $params->request_log_id);
      $stmt->bindParam('agency_id', $params->agency_id);
      $stmt->bindParam('subject', $subject);
      $stmt->bindParam('body', $params->body);
      $stmt->bindParam('outgoing', $params->outgoing);
      $stmt->execute();
      $params->id = $db->lastInsertId();

      $stmt = $db->prepare($sql2);
      $stmt->bindParam('request_log_id', $params->request_log_id);
      // the next_send_date today is just for the demo
      $stmt->bindParam('next_send_date', $timestamp);
      $stmt->execute();

	  $stmt = $db->prepare($sql3);
	  $stmt->bindParam('request_log_id', $params->request_log_id);
	  $stmt->execute();

      $db->commit();
      echo '{"status":"ok"}';
    } catch (PDOException $e) {
      $db->rollBack();
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error":{"text":'.$e->getMessage().'}}';
    }

    $sql4 = 'select email from agency_data where agency_id = :agency_id';

    $stmt = $db->prepare($sql4);
    $stmt->bindParam('agency_id', $params->agency_id);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_OBJ);
    if(count($results) > 0){
        $result = $results[0];
        sendMail('requestengine@foiamachine.org', $result->email, $subject, $params->body);
    }
    $sql5 = 'update request_log set sent = CURRENT_TIMESTAMP where id = :request_log_id';
    $stmt = $db->prepare($sql5);
	$stmt->bindParam('request_log_id', $params->request_log_id);
	$stmt->execute();

    $db = null;
  }

  function getRequestEmails() {
    $id = validateToken();
    if (!$id) {
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error": "invalid token"}';
      return;
    }

    $request = Slim::getInstance()->request();
    $params = json_decode($request->getBody());

    $sql = file_get_contents('../db/queries/request_emails.sql');

    try {
      $db = getConnection();
      $stmt = $db->prepare($sql);
      $stmt->bindParam('request_log_id', $params->id);
      $stmt->execute();
      $results = $stmt->fetchAll(PDO::FETCH_OBJ);
      echo json_encode($results);
    } catch (PDOException $e) {
      header('HTTP/1.0 420 Enhance Your Calm', true, 420);
      echo '{"error":{"text":'.$e->getMessage().'}}';
    }
  }
