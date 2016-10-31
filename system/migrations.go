package system

import (
	"flag"
	"fmt"
	"log"
	"os"
	"path"
	"time"

	"github.com/denisbakhtin/leonid/models"
	"github.com/jmoiron/sqlx"
	"github.com/rubenv/sql-migrate"
)

//RunMigrations applies database migrations for "migrations" dir, command:
//new - creates new blank migration in "migrations" directory. Edit that file as needed.
//"up", "down"- apply all pending migrations, or undo the last one
//"redo" - rollback last migration, then reapply it
//db - database handler
func RunMigrations(command *string) {
	switch *command {
	case "new":
		migrateNew()
		os.Exit(0)
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
		log.Fatalf("Wrong migration flag %q, acceptable values: up, down\n", *command)
	}
}

//migrateNew creates new blank migration
func migrateNew() {
	if len(flag.Args()) == 0 {
		log.Fatalf("ERROR: Migration's name not specified\n")
		return
	}
	name := path.Join("migrations", fmt.Sprintf("%d_%s.sql", time.Now().Unix(), flag.Arg(0)))
	file, err := os.Create(name)
	if err != nil {
		log.Printf("ERROR: %s\n", err)
		return
	}
	fmt.Fprintf(file, "-- +migrate Up\n")
	fmt.Fprintf(file, "-- SQL in section 'Up' is executed when this migration is applied\n\n\n")
	fmt.Fprintf(file, "-- +migrate Down\n")
	fmt.Fprintf(file, "-- SQL in section 'Down' is executed when this migration is rolled back\n\n\n")
	err = file.Close()
	if err != nil {
		log.Printf("ERROR: %s\n", err)
	} else {
		log.Printf("INFO: File %s has been successfully created\n", name)
	}
}

//migrateUp applies {{max}} pending db migrations. If max == 0, it applies all
func migrateUp(db *sqlx.DB, max int) {
	migrations := getMigrations()
	n, err := migrate.ExecMax(db.DB, "postgres", migrations, migrate.Up, max)
	if err != nil {
		log.Printf("ERROR: %s\n", err)
	} else {
		log.Printf("INFO: %d migration(s) applied\n", n)
	}
}

//migrateDown rolls back {{max}} db migrations. If max == 0, it rolles back all of them
func migrateDown(db *sqlx.DB, max int) {
	migrations := getMigrations()
	n, err := migrate.ExecMax(db.DB, "postgres", migrations, migrate.Down, max)
	if err != nil {
		log.Printf("ERROR: %s\n", err)
	} else {
		log.Printf("INFO: %d migration(s) rolled back\n", n)
	}
}

//getMigrations builds migration source from migrations folder
func getMigrations() *migrate.FileMigrationSource {
	migrations := &migrate.FileMigrationSource{
		Dir: "migrations",
	}
	return migrations
}
