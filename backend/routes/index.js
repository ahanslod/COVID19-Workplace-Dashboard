var express = require('express');
var router = express.Router();
const mysql = require(`mysql-await`);
const jwt = require('jsonwebtoken');
const accessTokenSecret = 'youraccesstokensecret';
const config = require('../modules/config.json');

const employeeExists = async (id) => {
  const result = await connection.awaitQuery(
    `SELECT * FROM Employee WHERE employeeId =? `,
    [id]
  );
  if (result[0]) {
    return true;
  }
  return false;
};
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, accessTokenSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

const connection = mysql.createConnection({
  multipleStatements: true,
  host: 'localhost',
  user: 'root',
  password: config.password,
  database: 'kepler',
});

async function returnQueryResult(res, query) {
  const result = await connection.awaitQuery(...query);
  if (Object.keys(result).length === 0) {
    res.status(404);
  }
  res.status(200).send(result);
}
router.get('/auth/user', authenticateJWT, async (req, res) => {
  let payload = req.user;
  delete payload.iat;
  res.send({ data: payload });
});
router.post('/auth/login', async (req, res) => {
  // Read username and password from request body
  const { username, password } = req.body;

  // Filter user from the users array by username and password
  const user = await connection.awaitQuery(
    'SELECT * FROM user WHERE username = ? AND password = ?',
    [username, password]
  );
  if (user[0]) {
    // Generate an access token
    const accessToken = jwt.sign(
      { username: user[0].username, level: user[0].level },
      accessTokenSecret
    );

    res.json({
      accessToken,
    });
  } else {
    res.status(404);
    res.send({ error: 'Username or password incorrect' });
  }
});
router.get('/employeeIds', authenticateJWT, async function (req, res, next) {
  returnQueryResult(res, [`SELECT employeeId FROM Employee`]);
});
router.get('/employees', authenticateJWT, async function (req, res, next) {
  returnQueryResult(res, [`SELECT * FROM Employee`]);
});

router.get(
  '/employees/quarantined',
  authenticateJWT,
  async function (req, res, next) {
    returnQueryResult(res, [
      `SELECT * FROM QuarantinedEmployee ORDER BY employeeId`,
    ]);
  }
);

router.get(
  '/employees/recovered',
  authenticateJWT,
  async function (req, res, next) {
    returnQueryResult(res, [
      `SELECT * FROM RecoveredEmployee ORDER BY employeeId`,
    ]);
  }
);

router.get(
  '/employees/tracers/covid',
  authenticateJWT,
  async function (req, res, next) {
    returnQueryResult(res, [
      `SELECT DISTINCT
  e.employeeId, e.firstName, e.lastName
FROM
  Employee e
      INNER JOIN
  LocationTracerReport ltr ON e.employeeID = ltr.employeeID
WHERE
  ltr.dateOfReport > DATE_SUB(CURDATE(), INTERVAL 18 DAY)
      AND EXISTS( SELECT 
          1
      FROM
          QuarantinedEmployee qe
              INNER JOIN
          LocationTracerReport ltr1 ON qe.employeeID = ltr1.employeeID
      WHERE
          qe.employeeID <> e.employeeID
              AND ltr.dateOfReport = ltr1.dateOfReport
              AND ltr.roomNumber = ltr1.roomNumber
              AND (ltr.timeOfEntry BETWEEN ltr1.timeOfEntry AND ltr1.timeOfDeparture
              OR ltr.timeOfDeparture BETWEEN ltr1.timeOfEntry AND ltr1.timeOfDeparture
              OR (ltr.timeOfEntry < ltr1.TimeOfEntry
              AND ltr.timeOfDeparture > ltr1.TimeOfDeparture)))
ORDER BY e.employeeId`,
    ]);
  }
);

router.get(
  '/schedules/:name',
  authenticateJWT,
  async function (req, res, next) {
    const { name } = req.params;
    const result = await connection.awaitQuery(
      `
  CREATE OR REPLACE VIEW departmentschedule(EmployeeID, FullName , DepartmentName , DateOfSchedule , ShiftStartTime , ShiftEndTime) AS
  SELECT 
      e.employeeId,
      CONCAT(e.firstName, ' ', e.lastName) AS FullName,
      e.departmentName,
      es.dateOfSchedule,
      es.shiftStartTime,
      es.shiftEndTime
  FROM
      Employee e
          JOIN
      EmployeeSchedule es ON e.employeeId = es.employeeId
          JOIN
      Department d ON e.departmentName = d.departmentName
  WHERE
      es.dateOfSchedule BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)
          AND d.departmentName = ?
  ORDER BY EmployeeId, FullName, DateOfSchedule;`,
      [name]
    );
    returnQueryResult(res, [`SELECT * FROM departmentschedule;`]);
  }
);
router.get(
  '/departments/report',
  authenticateJWT,
  async function (req, res, next) {
    const result = await connection.awaitQuery(`
CREATE OR REPLACE VIEW covidreport(departmentName, QuarantinedCount , RecoveredCount) AS
    SELECT 
        e.departmentName,
        COUNT(qe.employeeId) AS QuarantinedCount,
        COUNT(re.employeeId) AS RecoveredCount
    FROM
        Employee e
            LEFT JOIN
        QuarantinedEmployee qe ON e.employeeId = qe.employeeId
            LEFT JOIN
        RecoveredEmployee re ON e.employeeId = re.employeeId
    GROUP BY e.departmentName;`);
    returnQueryResult(res, [`SELECT * FROM covidreport;`]);
  }
);
router.get(
  '/employees/quarantined/contact',
  authenticateJWT,
  async function (req, res, next) {
    returnQueryResult(res, [
      `SELECT 
e.employeeId,
CONCAT(e.firstName, ' ', e.lastName) AS fullName,
e.emailAddress,
p.phoneNumber
FROM
Employee e
    LEFT JOIN
Phone p ON e.employeeId = p.employeeId
WHERE
EXISTS( SELECT 
        q.employeeId
    FROM
        QuarantinedEmployee q
    WHERE
        e.employeeId = q.employeeId)
ORDER BY employeeId, fullName;`,
    ]);
  }
);
router.get(
  '/reports/screening/:id',
  authenticateJWT,
  async function (req, res, next) {
    const { id } = req.params;
    returnQueryResult(res, [
      `
SELECT e.employeeId, e.firstName, e.lastName, s.temperature, 
    CASE WHEN (s.hasRecentlyTravelled OR s.hasCloseContact OR s.hasCough OR s.hasFever OR s.hasLethargy OR s.hasShortnessOfBreath)
        THEN TRUE
        ELSE FALSE
    END AS Symptoms, 
    s.dateOfReport AS 'Last Screening',
    ltr.dateOfReport AS'Last Location', ltr.timeOfEntry, ltr.timeOfDeparture, ltr.roomNumber
FROM Employee e
JOIN ScreeningReport s ON e.employeeId = s.employeeId
JOIN LocationTracerReport ltr ON s.employeeId = ltr.employeeId
WHERE e.employeeId = ?
    AND s.dateOfReport = (SELECT MAX(dateofReport) FROM ScreeningReport WHERE employeeID = ?)
    AND ltr.dateOfReport = (SELECT MAX(dateOfReport) FROM LocationTracerReport WHERE employeeID = ?)
LIMIT 1;`,
      [id, id, id],
    ]);
  }
);

router.post('/employees', authenticateJWT, async function (req, res, next) {
  const {
    departmentName,
    firstName,
    lastName,
    dateOfBirth,
    sex,
    height,
    streetNumber,
    streetName,
    city,
    province,
    postalCode,
    emailAddress,
  } = req.body;
  const payload = {
    departmentName,
    firstName,
    lastName,
    dateOfBirth,
    sex,
    height,
    streetNumber,
    streetName,
    city,
    province,
    postalCode,
    emailAddress,
  };
  console.log(payload);
  returnQueryResult(res, [
    `INSERT INTO Employee VALUES(0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      departmentName,
      firstName,
      lastName,
      dateOfBirth,
      sex,
      height,
      streetNumber,
      streetName,
      city,
      province,
      postalCode,
      emailAddress,
    ],
  ]);
});

router.post(
  '/employees/:id/phone',
  authenticateJWT,
  async function (req, res, next) {
    const { id } = req.params;
    const exists = await employeeExists(id);
    if (!exists) {
      res.status(404);
    }
    const { phoneNumber } = req.body;

    returnQueryResult(res, [
      `INSERT INTO Phone (phoneNumber, employeeId) values (?, ?);`,
      [phoneNumber, id],
    ]);
  }
);

router.post(
  '/reports/screening',
  authenticateJWT,
  async function (req, res, next) {
    const {
      employeeId,
      dateOfReport,
      temperature,
      hasRecentlyTravelled,
      hasCloseContact,
      hasCough,
      hasFever,
      hasLethargy,
      hasShortnessOfBreath,
    } = req.body;
    console.log(req.body);
    const exists = await employeeExists(employeeId);
    if (!exists) {
      res.status(404);
    }
    returnQueryResult(res, [
      `INSERT INTO ScreeningReport VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        employeeId,
        dateOfReport,
        temperature,
        hasRecentlyTravelled,
        hasCloseContact,
        hasCough,
        hasFever,
        hasLethargy,
        hasShortnessOfBreath,
      ],
    ]);
  }
);

router.post(
  '/reports/location',
  authenticateJWT,
  async function (req, res, next) {
    const {
      employeeId,
      dateOfReport,
      timeOfEntry,
      timeOfDeparture,
      roomNumber,
    } = req.body;
    const exists = await employeeExists(employeeId);
    if (!exists) {
      res.status(404);
    }
    returnQueryResult(res, [
      `INSERT INTO LocationTracerReport VALUES (?, ?, ?, ?, ?);`,
      [employeeId, dateOfReport, timeOfEntry, timeOfDeparture, roomNumber],
    ]);
  }
);

router.post(
  '/employees/quarantined',
  authenticateJWT,
  async function (req, res, next) {
    const { employeeId, dateDiagnosed, dateQuarantined } = req.body;
    const exists = await employeeExists(employeeId);
    if (!exists) {
      res.status(404);
    }
    returnQueryResult(res, [
      `INSERT INTO QuarantinedEmployee VALUES (?, ?, ?);`,
      [employeeId, dateDiagnosed, dateQuarantined],
    ]);
  }
);

router.delete(
  '/schedules/positive',
  authenticateJWT,
  async function (req, res) {
    returnQueryResult(res, [
      `DELETE FROM EmployeeSchedule es 
      WHERE EXISTS(
          SELECT 1 FROM ScreeningReport sr 
              WHERE es.employeeId = sr.employeeId 
              AND (sr.temperature > 38 OR sr.hasRecentlyTravelled OR sr.hasCloseContact OR hasCough OR hasFever OR hasLethargy OR hasShortnessOfBreath)
              AND (sr.dateOfReport >= DATE_ADD(NOW(), INTERVAL -14 DAY)) 
              AND es.dateOfSchedule BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)
          )
      OR EXISTS(
          SELECT 1 FROM QuarantinedEmployee qe
              WHERE es.employeeID = qe.employeeID
          )
      AND es.dateOfSchedule BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY);`,
    ]);
  }
);
module.exports = router;
