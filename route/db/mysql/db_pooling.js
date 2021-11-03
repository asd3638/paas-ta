var generic_pool = require("generic-pool");
var mysql = require("mysql");

config = {};
if (process.env.VCAP_SERVICES) {
  // cloud env 설정. 데이터 구조는 2.3.4 VCAP_SERVICES 환경정보 참고
  var cloud_env = JSON.parse(process.env.VCAP_SERVICES);
  var mysql_env = cloud_env["Mysql-DB"][0]["credentials"];

  config = {
    host: mysql_env.hostname,
    user: mysql_env.username,
    password: mysql_env.password,
    database: mysql_env.name,
  };
} else {
  // local env
  config = {
    host: "10.0.40.145",
    user: "d1c8dd80c66b16f4",
    password: "e592d8045c36f213",
    database: "op_bda60543_8511_4d06_a6b7_38e5942e6926",
  };
}

var pooling = generic_pool.Pool({
  name: "mysql",
  create: function (cb) {
    // create Connection
    var conn = mysql.createConnection(config);
    conn.connect(function (err) {
      if (err) console.log("mysql 연결오류");
      else {
        //  console.log("mysql 연결성공");
      }
      cb(err, conn);
      // 콜백함수를 통해 풀링에 커넥션 객체를 던짐
    });
  },
  destroy: function (myConn) {
    myConn.end(function (err) {
      if (err) console.log("mysql 연결해제오류");
      //    else    console.log("mysql 연결해제성공");
    });
  },
  min: 3,
  max: 5,
  idleTimeoutMillis: 1000 * 500,
  log: false,
});

process.on("exit", function () {
  pooling.drain(function () {
    pooling.destroyAllNow();
  });
});

module.exports = pooling;
