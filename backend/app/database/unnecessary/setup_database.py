#!/usr/bin/python3

import sqlite3

conn = sqlite3.connect('users.db')

c = conn.cursor()

# c.execute('''CREATE TABLE users
            #  (id text, name text)''')

c.execute("INSERT INTO users VALUES ('QWRT', 'Lara')")
c.execute("INSERT INTO users VALUES ('QSDF', 'Bene')")

conn.commit()

conn.close()
