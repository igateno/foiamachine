<?php
  require 'Slim/Slim/Slim.php';

  //////////////////////////////////////////////////////////////////////////
  //
  // App Instantiation and Routes
  //
  /////////////////////////////////////////////////////////////////////////

  $app = new Slim();

  // Auth
  $app->post('/auth', 'login');

  // Entities
  $app->get('/entities', 'getEntities');
  $app->get('/entities/type/:type', 'getEntitiesByType');
  $app->post('/entities', 'addEntity');

  $app->get('/countries', 'getCountries');
  $app->get('/topics', 'getTopics');
  $app->get('/doctypes', 'getDoctypes');

  // Relations
  $app->get('/relations', 'getRelations');

  // Agency Tabs (Entities and Relations tables)
  $app->post('/agencyTabs', 'agencyTabs');

  // Request Log
  $app->post('/requestLog', 'addRequestLog');
  $app->put('/requestLog', 'updateRequestLog');

  $app->run();

  //////////////////////////////////////////////////////////////////////////
  //
  // Authentication
  //
  /////////////////////////////////////////////////////////////////////////

  function userLookup($name) {
    $sql = "select id, hash, salt from users where name=:username";
    $db = getConnection();
    $stmt = $db->prepare($sql);
    $stmt->bindParam("username",$name);
    $stmt->execute();
    $auth = $stmt->fetchObject();
    $db = null;

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

    if (!$rslt) return false;

    $rslt_token = hash('sha256', $rslt->id.$rslt->salt.date("z"));
    if (strcmp($params->token, $rslt_token)) {
      return null;
    } else {
      return $rslt->id;
    }
  }

  function login(){
    $request = Slim::getInstance()->request();
    $params = json_decode($request->getBody());

    try {
      $rslt = userLookup($params->username);
    } catch (PDOException $e) {
      echo '{"error":{"text":'.$e->getMessage().'}}';
      return;
    }

    $user_hash = hash('sha256', $params->password.$rslt->salt);
    if (strcmp($user_hash, $rslt->hash)) {
      echo '{"token":""}';
    } else {
      $token = hash('sha256', $rslt->id.$rslt->salt.date("z"));
      echo '{"username":"'.$params->username.'","token":"'.$token.'"}';
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
  // Agency Tabs
  //
  // The functions below use the entities and relations tables to populate
  // the agencies suggested to the user during the request composition
  // process.
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
      // TODO echo error message? did that not happen already?
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
    // TODO
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

  // WARNING!
  // This function exists solely for testing purposes
  // Code with this functon uncommented should never be commited
  // under any circumstances. In fact, TODO make this function
  // dissapear ASAP and replace with a production ready way to
  // add users
  /*function addUser($name, $pass) {
    $salt = hash('sha256', uniqid(mt_rand(),true));
    $hash = hash('sha256', $pass.$salt);
    $sql = "insert into users (name, hash, salt, type)".
           "values (:name, :hash, :salt, 1)";
    try {
      $db = getConnection();
      $stmt = $db->prepare($sql);
      $stmt->bindParam("name", $name);
      $stmt->bindParam("hash", $hash);
      $stmt->bindParam("salt", $salt);
      $stmt->execute();
      $auth = $stmt->fetchObject();
      $auth->id = $db->last_insert_id();
      $db = null;
      echo json_encode($auth);
    } catch (PDOException $e) {
      echo '{"error":{"text":'.$e->getMessage().'}}';
    }
  }*/

?>
