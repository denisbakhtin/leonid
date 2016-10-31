package system

import (
	"log"
	"os"

	"github.com/denisbakhtin/leonid/models"
	"github.com/jmoiron/sqlx"
	"github.com/rubenv/sql-migrate"
)

var migrations = migrate.MemoryMigrationSource{
	[]*migrate.Migration{

		&migrate.Migration{
			Id: "create users table",
			Up: []string{`
				CREATE TABLE users(
					id SERIAL PRIMARY KEY,
					name TEXT NOT NULL,
					email TEXT NOT NULL UNIQUE,
					password TEXT NOT NULL,
					timestamp TIMESTAMP
				);
			`},
			Down: []string{"DROP TABLE users;"},
		},

		&migrate.Migration{
			Id: "create pages table",
			Up: []string{`
				CREATE TABLE pages(
					id SERIAL PRIMARY KEY,
					name TEXT NOT NULL,
					slug TEXT NOT NULL,
					content TEXT NOT NULL,
					published boolean NOT NULL DEFAULT true,
					created_at TIMESTAMP,
					updated_at TIMESTAMP
				);
			`},
			Down: []string{"DROP TABLE pages;"},
		},

		&migrate.Migration{
			Id: "create categories table",
			Up: []string{`
				CREATE TABLE categories(
					id SERIAL PRIMARY KEY,
					name TEXT NOT NULL,
					slug TEXT NOT NULL,
					content TEXT NOT NULL,
					published boolean NOT NULL DEFAULT true,
					created_at TIMESTAMP,
					updated_at TIMESTAMP
				);
			`},
			Down: []string{"DROP TABLE categories;"},
		},

		&migrate.Migration{
			Id: "create products table",
			Up: []string{`
				CREATE TABLE products(
					id SERIAL PRIMARY KEY,
					name TEXT NOT NULL,
					slug TEXT NOT NULL,
					content TEXT NOT NULL,
					image TEXT NOT NULL,
					published boolean NOT NULL DEFAULT true,
					category_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT,
					created_at TIMESTAMP,
					updated_at TIMESTAMP
				);
			`},
			Down: []string{"DROP TABLE products;"},
		},
	},
}

/*
	RunMigrations applies database migrations for "migrations" dir, command:
	"up" -  apply all pending migrations, or undo the last one
	"down" - undo last migration
	"redo" - redo last migration
	db - database handler
*/
func RunMigrations(command *string) {
	switch *command {
	case "up":
		migrateUp(models.GetDB(), 0)
		os.Exit(0)
	case "down":
		migrateDown(models.GetDB(), 1)
		os.Exit(0)
	case "redo":
		migrateDown(models.GetDB(), 1)
		migrateUp(models.GetDB(), 1)
		os.Exit(0)
	case "skip":
	default:
		log.Fatalf("Wrong --migrate param value: %s\n", *command)
	}
}

//migrateUp applies {{max}} pending db migrations. If max == 0, it applies all
func migrateUp(db *sqlx.DB, max int) {
	n, err := migrate.ExecMax(db.DB, "postgres", migrations, migrate.Up, max)
	if err != nil {
		log.Printf("ERROR: %s\n", err)
	} else {
		if n > 0 {
			log.Printf("INFO: %d migration(s) applied\n", n)
		}
	}
}

//migrateDown rolls back {{max}} db migrations. If max == 0, it rolles back all of them
func migrateDown(db *sqlx.DB, max int) {
	n, err := migrate.ExecMax(db.DB, "postgres", migrations, migrate.Down, max)
	if err != nil {
		log.Printf("ERROR: %s\n", err)
	} else {
		log.Printf("INFO: %d migration(s) rolled back\n", n)
	}
}
