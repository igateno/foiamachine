<?php
  require 'Slim/Slim/Slim.php';

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
  $app->get('/topics', 'getTopics');
  $app->get('/doctypes', 'getDoctypes');

  // Relations
  $app->get('/relations', 'getRelations');

  // Entities and Relations tables
  $app->post('/agencyTabs', 'agencyTabs');
  $app->post('/requestPreviews', 'requestPreviews');

  // Request Log
  $app->post('/requestLog', 'addRequestLog');
  $app->put('/requestLog', 'updateRequestLog');

  $app->post('/requestAgencies', 'addRequestAgencies');
  $app->post('/requestDoctypes', 'addRequestDoctypes');

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
      $auth = $stmt->fetchObject();
      $id = $db->last_insert_id();
      $db = null;
      echoToken($id, $salt);
    } catch (PDOException $e) {
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
      echo '{"error":{"text":'.$e->getMessage().'}}';
    }
  }

  function getCountries() {
    getEntitiesByType(1);
  }

  function getTopics() {
    getEntitiesByType(3);
  }

  function getDoctypes() {
    getEntitiesByType(4);
  }

  function addEntity(){
    $id = validateToken();
    if (!$id) {
      echo '{"error": "invalid token"}';
      return;
    }

     error_log('addEntity'."\n", 3, '/var/tmp/php.log');
     $request = Slim::getInstance()->request();
     $entity = json_decode($request->getBody());
    $sql = "insert into entities (name, type) values(:name, :type)";
     try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("name", $entity->name);
        $stmt->bindParam("type", $entity->type);
        $stmt->execute();
        $entity->id = $db->lastInsertId();
        $db = null;
        echo json_encode($entity);
     }catch(PDOException $e){
        error_log($e->getMessage()."\n", 3, '/var/tmp/php.log');
        echo '{"error":{"text":'.$e->getMessage().'}}';
     }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  // Relations
  //
  /////////////////////////////////////////////////////////////////////////

  function getRelations(){
     $sql = "select e1.name as name1, r.type, e2.name as name2 " .
       "from entities as e1, entities as e2, relations as r " .
       "where e1.id = r.id1 and e2.id = r.id2;";
     try{
        $db = getConnection();
        $stmt = $db->query($sql);
        $relations = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo json_encode($relations);
     }catch(PDOException $e){
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
      echo '{"error":{"text":'.$e->getMessage().'}}';
    }

    return $results;
  }

  function agencyTabs() {
    if (!validateToken()) {
      echo '{"error": "invalid token"}';
      return;
    }

    $results = agencyTabsQuery();

    if (!$results) {
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
      echo '{"error":{"text":'.$e->getMessage().'}}';
    }

    return $results;
  }

  function requestPreviews() {
    $id = validateToken();
    if (!$id) {
      echo '{"error": "invalid token"}';
      return;
    }

    $results = requestPreviewsQuery();

    if (!$results) {
      echo '{"error":"Database query produced no results in requestPreviews."}';
    } else {
      $previews = array();
      $previews['agencies'] = array();
      $previews['doctypes'] = array();
      foreach ($results as $result) {
        if (!array_key_exists('question', $previews))
          $previews['question'] = $result->question;
        if (!array_key_exists($result->agency_id, $previews['agencies']))
          $previews['agencies'][$result->agency_id] = $result->agency_name;
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
      echo '{"error": "invalid token"}';
      return;
    }

    $request = Slim::getInstance()->request();
    $params = json_decode($request->getBody());

    $sql = 'insert into request_log (user_id, country_id, topic_id)'.
           'values (:user_id, :country_id, :topic_id)';
    try{
      $db = getConnection();
      $stmt = $db->prepare($sql);
      $stmt->bindParam('user_id', $id);
      $stmt->bindParam('country_id', $params->country);
      $stmt->bindParam('topic_id', $params->topic);
      $stmt->execute();
      $params->id = $db->lastInsertId();
      $db = null;
      echo json_encode($params);
    }catch(PDOException $e){
      echo '{"error":{"text":'.$e->getMessage().'}}';
    }
  }

  function updateRequestLog() {
    $id = validateToken();
    if (!$id) {
      echo '{"error": "invalid token"}';
      return;
    }

    $request = Slim::getInstance()->request();
    $params = json_decode($request->getBody());

    $sql = 'update request_log set '.
           'start_date = :start_date, '.
           'end_date = :end_date, '.
           'question = :question '.
           'where id = :id';

    try {
      $db = getConnection();
      $stmt = $db->prepare($sql);
      $stmt->bindParam('id', $params->id);
      $stmt->bindParam('start_date', $params->start);
      $stmt->bindParam('end_date', $params->end);
      $stmt->bindParam('question', $params->question);
      $stmt->execute();
    } catch (PDOException $e) {
      echo '{"error":{"text":'.$e->getMessage().'}}';
    }
  }

  function addRequestAgencies() {
    $id = validateToken();
    if (!$id) {
      echo '{"error": "invalid token"}';
      return;
    }

    $request = Slim::getInstance()->request();
    $params = json_decode($request->getBody());

    $sql = 'insert into request_log_agencies (request_log_id, agency_id)'.
           'values (:request_log_id, :agency_id)';
    try{
      $db = getConnection();
      $stmt = $db->prepare($sql);
      $stmt->bindParam('request_log_id', $params->request_log_id);
      $stmt->bindParam('agency_id', $params->agency_id);
      $stmt->execute();
      $db = null;
    }catch(PDOException $e){
      echo '{"error":{"text":'.$e->getMessage().'}}';
    }
  }

  function addRequestDoctypes() {
    $id = validateToken();
    if (!$id) {
      echo '{"error": "invalid token"}';
      return;
    }

    $request = Slim::getInstance()->request();
    $params = json_decode($request->getBody());

    $sql = 'insert into request_log_doctypes (request_log_id, doctype_id)'.
           'values (:request_log_id, :doctype_id)';
    try{
      $db = getConnection();
      $stmt = $db->prepare($sql);
      $stmt->bindParam('request_log_id', $params->request_log_id);
      $stmt->bindParam('doctype_id', $params->doctype_id);
      $stmt->execute();
      $db = null;
    }catch(PDOException $e){
      echo '{"error":{"text":'.$e->getMessage().'}}';
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  // DB Connection
  //
  /////////////////////////////////////////////////////////////////////////

  function getConnection(){
     $dbhost = "localhost";
     $dbuser = "foia";
     $dbpassphrase = "foiamachine";
     $dbname = "foia";
     $dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser,
          $dbpassphrase);
     $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
     return $dbh;
  }

?>
