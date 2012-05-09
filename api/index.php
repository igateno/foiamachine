<?php
  require 'Slim/Slim.php';
  
  $app = new Slim();
  $app->get('/entities', 'getEntities');
  $app->get('/entities/:id', 'getEntity');
  $app->get('/entities/search/:query', 'findByName');
  $app->post('/entities', 'addEntity');
  $app->post('/entities/:id', 'updateEntity');
  $app->post('/entities/:id', 'deleteEntity');

  $app->run();

  function getEntities(){
     echo 'getting entities';
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
     $entity = json_encode($request->getBody());
     $sql = "insert into entities (name, type) values(:name, :type)";
     try{
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("name", $entity->name);
        $stmt->bindParam("type", $entity->type);
        $stmt->execute();
        $entity = $stmt->fetchObject();
        $entity->id = $db->lastInsertId();
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
        echo '{"error":{"text".$e.getMessage().'}}';
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
        echo '{"error":{"text".$e.getMessage().'}}';
     }
  }

  function getConnection(){
     $dbhost = "mysql-user-master.stanford.edu";
     $dbuser = "ccs108drpaudel";
     $dbpassphrase = "zaevahzu";
     $dbname = "c_cs108_drpaudel";
     $dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser,
          $dbpassphrase);
     $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
     return $dbh;
  }

?>