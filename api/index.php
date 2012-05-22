<?php
  require 'Slim/Slim/Slim.php';

  $app = new Slim();

  // Entities
  $app->get('/entities', 'getEntities');
  $app->get('/entities/:id', 'getEntity');
  $app->get('/entities/search/:query', 'findByName');
  $app->post('/entities', 'addEntity');
  $app->post('/entities/:id', 'updateEntity');
  $app->post('/entities/:id', 'deleteEntity');

  // Relations
  $app->get('/relations', 'getRelations');

  $app->run();

  function getEntities(){
     $sql = "select * from entities order by name";
     try{
        $db = getConnection();
        $stmt = $db->query($sql);
        $entities = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo json_encode($entities);
     }catch(PDOException $e){
        echo '{"error":{"text":'.$e.getMessage().'}}';
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
        echo '{"error":{"text":'.$e.getMessage().'}}';
     }
  }

  function addEntity(){
     error_log('addEntity\n', 3, '/var/tmp/php.log');
     $request = Slim::getInstance()->request();
     $entity = json_decode($request->getBody());
    $sql = "insert into entities (name, type) values(:name, :type)";
     try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("name", $entity->name);
        $stmt->bindParam("type", $entity->type);
        $stmt->execute();
        $entity = $stmt->fetchObject();
        $entity->id = $db->last_insert_id();
        $db = null;
        echo json_encode($entity);
     }catch(PDOException $e){
        error_log($e->getMessage(), 3, '/var/tmp/php.log');
        echo '{"error":{"text":'.$e.getMessage().'}}';
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
        echo '{"error":{"text":'.$e.getMessage().'}}';
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
        echo '{"error":{"text"'.$e.getMessage().'}}';
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
        echo '{"error":{"text"'.$e.getMessage().'}}';
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
