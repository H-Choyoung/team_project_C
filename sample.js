
import http from 'http';
// import fs from 'fs';
import query from 'querystring';
import url from 'url';
const port = process.env.PORT || 3000

import mysql from 'mysql'; 
let databaseName = 'userdata';
//mysql���� ����
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'fullstack305',
  database: `${databaseName}` 
});
// connection.connect(); 



//���� ����
const app = http.createServer(function(req, res) {
  let _url = req.url;
  let pathname = url.parse(_url, true).pathname;
  //url.parse(): url���ڿ��� �Է��ϸ� url��ü�� �����. 
  //url.parse(String, (boolean), (boolean)) => true�϶� object, false�϶� ���ڿ�
  if(pathname === '/'){
    //���� ù�������� �� ���̴� ȭ��
    res.writeHead(200);
    res.end(`
    <!doctype html>
      <html>
      <head>
        <title>POST</title>
        <meta charset="utf-8">
      </head>
      <body>
        <form id="signup" action="/post_test" method="POST">
          <input type="text" name="id" placeholder="id" /><br><br>
          <input type="text" name="username" placeholder="username" /><br><br>
          <input type="text" name="pw" placeholder="pw" /><br><br>
          <input type="text" name="email" placeholder="email" /><br>
          <button type="submit"> sign-up </button>
        </form>
        <button type="button" onclick="location.href='/login'">Login</button>
      </body>
      </html>`);

  } else if(pathname === '/post_test'){
    //ȸ������ �� ����� �Ѿ�� ȭ�� 
    let body = '';
    req.on('data', function(data){
      body = body + data;
    });
    req.on('end', function() {
      let post = query.parse(body);
      console.log(post);
      let id = post.id;
      let username = post.username;
      let pw = post.pw;
      let email = post.email;
      
      //��ü ����� JSON���Ϸ� �Ľ�
      const obj = JSON.parse(JSON.stringify(post));
      let keys = Object.keys(obj);
      //Object.Keys(obj)�޼���� ��ü�� 'Ű'�� ���� �迭�� ��ȯ�Ѵ�. 

      //������ DB���̺� insert�ϱ� 
      let sql = 'INSERT INTO userinfo(user_id, name, password, email) VALUES(?,?,?,?)';
      let params = [obj[keys[0]], obj[keys[1]], obj[keys[2]], obj[keys[3]]];
      //userinfo���̺��� user_id, name, password, email
      connection.query(sql, params, function(err, row, fields) {
        if(err) {
          console.log(err);
        } else {
          console.log(row);
        }
      });
      // connection.end(); 
      
      // res.writeHead(302, {Location: '/'});
      //�� ���� �� id, username, pw, email ȭ�鿡 ��µ�
      res.end(`
      <!doctype html>
      <html>
      <head>
        <title>POST</title>
        <meta charset="utf-8">
      </head>
      <body>
        <p>id : ${id}</p>
        <p>username : ${username}</p>
        <p>pw : ${pw}</p>
        <p>email : ${email}</p>
      </body>
      </html>
      `
      );
    });

  } else if(pathname === '/login') {
    //�α��� ������
    let html = `
    <!doctype html>
      <html>
      <head>
        <title>LOGIN</title>
        <meta charset="utf-8">
      </head>
      <body>
        <form id="login" action="/login_test" method="POST">
          <input type="text" name="id" placeholder="id" /><br>
          <input type="text" name="pw" placeholder="pw" /><br>
          <button type="submit"> login </button>
        </form>
      </body>
      </html>
    `;
    res.writeHead(200);
    res.end(html);

  } else if(pathname === '/login_test'){
    let body = '';
    req.on('data', function(data){
      body = body + data;
    });
    req.on('end', function(req){
      let post = query.parse(body);

      const obj2 = JSON.parse(JSON.stringify(post));
      let keys = Object.keys(obj2);

      let sql = 'SELECT user_id, password FROM userinfo WHERE user_id = ?';
      //userinfo���̺��� id, pw�� ��ġ�ϴ� id�� ��ȸ
      let params = [obj2[keys[0]]];
      connection.query(sql, params, function(err, result) {
      try{
        let input_id = obj2[keys[0]];
        let input_pw = obj2[keys[1]];

        let valid_id = result[0].user_id; //DB�� user_id �����Ͱ�
        let valid_pw = result[0].password; //DB�� password �����Ͱ�

        if(input_id === valid_id){
          if(input_pw === valid_pw){
          console.log('�α��� ����');
          // connection.end();
          res.writeHead(302, {Location:'/login_after'});
          res.end();
          } else {
            console.log('��й�ȣ�� Ȯ��');
            // connection.end();
            res.writeHead(302, {Location:'/login'});
            res.end();
            }
          }
        } catch(error) {
          console.log('��ϵ��� ���� ȸ���Դϴ� ');
          // connection.end();
          res.writeHead(302, {Location:'/'});
          res.end();
        }
      });
    });

  } else if(pathname === '/login_after'){
    res.writeHead(200);
    res.end(`
    <!doctype html>
      <html>
      <head>
        <title>Welcome</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h2>ȯ���մϴ�!</h2>
      </body>
      </html>`);

  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});


app.listen(port, () => console.log(`server started on port ${port};` + 'press Ctrl-C to terminate...'));
