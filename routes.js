const config = require('./config');
config.setup.headers(config.setup.app, config.setup.parser);

config.setup.app.use("/api/majors", (req, res) => {
  const query = `select * from major`;
  if (query) {
    config.setup.dbase.all(query, [], (err, rows) => {
      res.send(rows);
    });
  }
});

config.setup.app.use("/api/minors", (req, res) => {
  const query = `select * from minor`;
  if (query) {
    config.setup.dbase.all(query, [], (err, rows) => {
      res.send(rows);
    });
  }
});

config.setup.app.use("/api/students", (req, res) => {
  const query = `select * from student`;
  if (query) {
    config.setup.dbase.all(query, [], (err, rows) => {
      res.send(rows);
    });
  }
});

config.setup.app.use("/api/instructors", (req, res) => {
  const query = `select * from instructor`;
  if (query) {
    config.setup.dbase.all(query, [], (err, rows) => {
      res.send(rows);
    });
  }
});

config.setup.app.use("/api/departments", (req, res) => {
  const query = `select * from department`;
  if (query) {
    config.setup.dbase.all(query, [], (err, rows) => {
      res.send(rows);
    });
  }
});

config.setup.app.post("/api/add_major", (request, response) => {
  const searchQuery =
    "select * from Major where Major.description = '" +
    request.body.description +
    "'";
  config.setup.dbase.all(searchQuery, [], (err, rows) => {
    if (rows == undefined || rows.length == 0) {
      const sql = `INSERT INTO
                 Major(description, type)
               VALUES (?, ?)`;
      const major = [request.body.description, request.body.type];
      if (sql && major !== undefined && major !== []) {
        config.setup.dbase.run(sql, major);
        response.send(major);
      } else {
        response.send("Adding major failed! Make sure no setup is missing");
      }
    } else {
      response.send("Major already exists");
    }
  });
});

config.setup.app.use("/api/add_student", (req, res) => {
  let degree = {
    major: null,
    minor: null
  };

  const majorQuery =
    `select * from major where description = '` +
    req.body.majorDescription +
    "'";
  const minorQuery =
    `select * from minor where description = '` +
    req.body.minorDescription +
    "'";
  if (majorQuery) {
    config.setup.dbase.all(majorQuery, [], (err, rows) => {
      if (rows[0]) {
        degree.major = rows[0].major_id;
      }

      if (minorQuery) {
        config.setup.dbase.all(minorQuery, [], (err, rows2) => {
          if (rows2) {
            degree.minor = rows2[0].minor_id;
          }

          const insertSQL = `INSERT INTO
          student(first_name, last_name, dob, grade, date_started, graduation_date, email, phone,
          student_major_id, student_minor_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          let student = [
            req.body.firstName,
            req.body.lastName,
            req.body.dob,
            req.body.year,
            req.body.dateStart,
            req.body.gradDate,
            req.body.email,
            req.body.phone,
            degree.major,
            degree.minor
          ];
          if (insertSQL && student !== undefined && student !== []) {
            config.setup.dbase.run(insertSQL, student);
            res.send(student);
          } else {
            res.send("Adding student failed! Make sure no setup is missing.");
          }
        });
      }
    });
  }
});

config.setup.app.use("/api/add_instructor", (req, res) => {
  const findInstructor =
    `select * from instructor where instructor_id = ` + req.body.instructor_id;
  if (findInstructor) {
    config.setup.dbase.all(findInstructor, [], (err, rows) => {
      if ((rows = [] || !rows[0] || err)) {
        config.setup.dbase.all(
          "select department_id from department where department.description ='" +
            req.body.description +
            "'",
          [],
          (err, rows) => {
            var department_id =
              rows == undefined || rows.length == 0 ? 0 : rows[0].department_id;
            const sql = `INSERT INTO
                     instructor(first_name, last_name, dob, email, phone, position_type, date_hired, department_id)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            const instructor = [
              req.body.firstName || "default",
              req.body.lastName || "default",
              req.body.dob,
              req.body.email,
              req.body.phone,
              req.body.positionType,
              req.body.dateHired,
              department_id
            ];
            if (sql && instructor[0] !== "default") {
              config.setup.dbase.run(sql, instructor);
              config.setup.dbase.all('select * from instructor', [], (err, rows) => {
                if(!err) {
                  res.send(rows);
                }
              });
            } else {
              res.send(
                "Adding instructor failed! Make sure no setup is missing."
              );
            }
          }
        );
      }
    });
  }
});

config.setup.app.use("/api/add_department", (req, res) => {
  const deptQuery =
    "select * from department where department.description = '" +
    String(req.body.description).toLowerCase() +
    "'"; //check if department exists
  config.setup.dbase.all(deptQuery, [], (err, rows) => {
    if (rows == undefined || rows.length < 1) {
      const department = [req.body.description];
      const insertDept = `insert into department(description) values (?)`;
      if (department.length == 1 && insertDept) {
        const department = [req.body.description];
        const insertDept = `insert into department(description) values (?)`;
        config.setup.dbase.run(insertDept, department);
        res.send(req.body.description + " was added.");
      } else {
        res.send(
          "Cannot do an insert with an invalid query and/or missing setup"
        );
      }
      config.setup.dbase.run(insertDept, department);
      res.send(req.body.description + "was added.");
    } else {
      res.send(req.body.description + "already exits");
    }
  });
});

config.setup.app.use("/api/edit_major", (req, res) => {
  const searchSQL = `select * from major where description = ? and type = ?`;
  const params = [req.body.description, req.body.type];
  if ((searchSQL && params !== undefined) || params.length == 0) {
    config.setup.dbase.get(searchSQL, params, (err, rows) => {
      if (rows) {
        const update = `update Major set description = ?, type = ? where description = ?`;
        const values = [
          String(req.body.newDescription),
          String(req.body.newType),
          String(req.body.description)
        ];
        if (update && values !== undefined && values.length > 0) {
          config.setup.dbase.run(update, values, err => {
            if (err) {
              res.send(err);
            } else {
              res.send(req.body.description + "has been updated");
            }
          });
        }
      }
    });
  }
});

config.setup.app.use("/api/edit_minor", (request, response) => {
  const searchSQL = `select * from minor where description = ?`;
  const params = [request.body.description];
  if ((searchSQL && params !== undefined) || params.length == 0) {
    config.setup.dbase.all(searchSQL, params, (err, rows) => {
      if (rows[0]) {
        const update = `update Minor set description = ? where description = ?`;
        const values = [
          String(request.body.newDescription),
          String(request.body.description)
        ];
        if (update && values !== undefined && values.length > 0) {
          config.setup.dbase.run(update, values, err => {
            if (err) {
              response.send(err);
            } else {
              response.send(request.body.description + " has been updated");
            }
          });
        }
      }
    });
  }
});

config.setup.app.use("/api/edit_student", (req, res) => {
  const query = `select * from STUDENT where student_id = ?`;
  config.setup.dbase.get(query, req.body.student_id, (err, record) => {
    const update = `update STUDENT set first_name = ?, last_name = ?, dob = ?,
    grade = ?, date_started = ?, graduation_date = ?, email = ?, phone = ?,
    student_major_id = ?, student_minor_id = ? where student_id = ?`;
    if (update) {
      const degree = {
        major: null,
        minor: null
      };
      const findMajor = "select * from major where description = ?";
      const findMinor = "select * from minor where description = ?";
      if (findMajor && req.body.major) {
        config.setup.dbase.get(findMajor, req.body.major, (err, row) => {
          if (!err && row) {
            degree.major = row.major_id;
          }

          if (findMinor && req.body.minor) {
            config.setup.dbase.get(findMinor, req.body.minor, (err, row) => {
              if (!err && row) {
                degree.minor = row.minor_id;
              }

              const params = [
                req.body.firstName,
                req.body.lastName,
                req.body.dob,
                req.body.grade,
                req.body.date_started,
                req.body.graduation_date,
                req.body.email,
                req.body.phone,
                degree.major,
                degree.minor,
                req.body.student_id
              ];
              config.setup.dbase.run(update, params);
            });
          }
        });
      }
    }
  });
});

config.setup.app.use("/api/edit_instructor", (req, res) => {

  if(req.body.instructor_id) {
    const query = `select * from instructor where instructor_id = ?`;
    if (query) {
      config.setup.dbase.get(query, req.body.instructor_id, (err, row) => {
        if (row) {
          const deptQuery = `select * from department where description = ?`;
          const update = `update instructor set first_name = ?, last_name = ?, dob = ?,
          email = ?, phone = ?, position_type = ?, date_hired = ?, department_id = ?
          where instructor_id = ?`;
          if (deptQuery) {
            config.setup.dbase.get(deptQuery, req.body.description, (err, row2) => {
              let dept = {
                id: null
              };
              if (row2) {
                dept.id = row2.department_id;
              }
              if (update) {
                const instructor = [
                  req.body.firstName,
                  req.body.lastName,
                  req.body.dob,
                  req.body.email,
                  req.body.phone,
                  req.body.positionType,
                  req.body.dateHired,
                  dept.id,
                  row.instructor_id
                ];
                config.setup.dbase.run(update, instructor);
                config.setup.dbase.all('select * from instructor', [], (err, rows) => {
                  if(!err) {
                    res.send(rows);
                  }
                });
              }
            });
          }
        }
      });
    }
  } else {
    res.send('Instructor id must be provided')
  }
});

config.setup.app.use("/api/edit_department", (req, res) => {
  const query =
    `select * from department where description = '` +
    req.body.description +
    "'";
  if (query) {
    config.setup.dbase.get(query, [], (err, row) => {
      if (row) {
        const update = `update department set description = ? where description = ?`;
        if (update) {
          config.setup.dbase.run(update, [req.body.newDescription, req.body.description]);
        }
      } else {
        res.send("Department not found...");
      }
    });
  } else {
    res.send("Id not provided...");
  }
});

config.setup.app.use("/api/delete_major", (request, response) => {
  const query = `select * from major where description = ?`;
  if (query && request.body.description) {
    config.setup.dbase.get(query, request.body.description, (err, row) => {
      if (row) {
        const del = `delete from major where description = ?`;
        if (del && request.body.description) {
          config.setup.dbase.run(del, [request.body.description]);
          row.message = "Major has been deleted.";
          res.send(row);
        }
      } else {
        response.send("Major not found");
      }
    });
  } else {
    response.send("Description needed for delete!");
  }
});

config.setup.app.use("/api/delete_minor", (request, response) => {
  const query = `select * from minor where description =  ?`;
  if (query && request.body.description) {
    config.setup.dbase.get(query, request.body.description, (err, row) => {
      if (row) {
        const del = `delete from minor where description = ?`;
        if (del && request.body.description) {
          config.setup.dbase.run(del, [request.body.description]);
          row.message = "Minor has been deleted.";
          res.send(row);
        }
      } else {
        response.send("minor not found");
      }
    });
  } else {
    response.send("description needed for deletion");
  }
});

config.setup.app.use("/api/delete_department", (request, body) => {
  const query = `select * from department where description =  ?`;
  if (query && request.body.description) {
    config.setup.dbase.get(query, request.body.description, (err, row) => {
      if (row) {
        const del = `delete from department where description = ?`;
        if (del && request.body.description) {
          config.setup.dbase.run(del, [request.body.description]);
          row.message = "Department has been deleted.";
          res.send(row);
        }
      } else {
        response.send("department not found");
      }
    });
  } else {
    response.send("description needed for deletion");
  }
});

config.setup.app.use("/api/delete_student", (req, res) => {
  const query = `select * from student where student_id =  ?`;
  if (query && req.body.student_id) {
    config.setup.dbase.get(query, req.body.student_id, (err, row) => {
      if (row) {
        const del = `delete from student where student_id = ?`;
        if (del && req.body.student_id) {
          config.setup.dbase.run(del, [req.body.student_id]);
          row.message = "Student has been deleted.";
          res.send(row);
        }
      } else {
        res.send("student not found");
      }
    });
  } else {
    res.send("id needed for deletion");
  }
});

config.setup.app.use("/api/delete_instructor/:id", (req, res) => {
  const query = `select * from instructor where instructor_id =  ?`;
  if (query && req.params.id) {
    config.setup.dbase.get(query, req.params.id, (err, row) => {
      if (row) {
        const del = `delete from instructor where instructor_id = ?`;
        if (del && req.params.id) {
          config.setup.dbase.run(del, [req.params.id]);
          row.message = "Instructor has been deleted.";
          res.send(row);
        }
      } else {
        res.send("instructor not found");
      }
    });
  } else {
    res.send("id needed for deletion");
  }
});

config.setup.app.listen(80);
