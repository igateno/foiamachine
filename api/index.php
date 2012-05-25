<?php
  require 'Slim/Slim/Slim.php';

  $app = new Slim();

  // Auth
  $app->post('/auth', 'login');

  // Entities
  $app->get('/entities', 'getEntities');
  $app->get('/entities/:id', 'getEntity');
  $app->get('/entities/type/:type', 'getEntitiesByType');
  $app->get('/entities/search/:query', 'findByName');
  $app->post('/entities', 'addEntity');
  $app->post('/entities/:id', 'updateEntity');
  $app->post('/entities/:id', 'deleteEntity');

  // Relations
  $app->get('/relations', 'getRelations');

  // Countries
  $app->get('/countries', 'getCountries');

  // Topics
  $app->get('/topics', 'getTopics');

  $app->run();

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

  function validToken() {
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
      return false;
    } else {
      return true;
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

  function getEntity($id){
     $sql = "select * from entities where id=:id";
     try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $entity = $stmt->fetchObject();
        $db = null;
        echo json_encode($entity);
     }catch(PDOException $e){
        echo '{"error":{"text":'.$e->getMessage().'}}';
     }
  }

  function addEntity(){
    if (!validToken()) {
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

  function updateEntity(){
     $request = Slim::getInstance()->request();
     $entity = jsonEncode($request->getBody());
     $sql = "update entities set name=:name, type=:type where id=:id";
     try{
        $db = getConnection();
        $stmt = $db->query($sql);
        $stmt->bindParam("name", $entity->name);
        $stmt->bindParam("type", $entity->type);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $db = null;
        echo json_encode($entity);
     }catch(PDOException $e){
        echo '{"error":{"text":'.$e->getMessage().'}}';
     }
  }

  function deleteEntity($id){
     $sql = "delete from entities where id=:id";
     try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $db = null;
     }catch (PDOException $e){
        echo '{"error":{"text"'.$e->getMessage().'}}';
     }
  }

  function findByName($query){
     $sql = "select * from entities where name=:name";
     try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $query = "%".$query."%";
        $stmt->bindParam("query", $query);
        $stmt->execute();
        $entities = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo json_encode($entities);
     }catch (PDOException $e){
        echo '{"error":{"text"'.$e->getMessage().'}}';
     }
  }

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
