#include "database.h"
#include <stdio.h>
#include <stdlib.h>

static sqlite3 *db = NULL;

#define CURRENT_SCHEMA_VERSION 1

static int get_schema_version() {
    sqlite3_stmt *stmt;
    int version = 0;

    const char *check_sql = "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'";
    int rc = sqlite3_prepare_v2(db, check_sql, -1, &stmt, NULL);
    if (rc != SQLITE_OK) {
        return -1;
    }

    rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);

    if (rc != SQLITE_ROW) {
        return 0;
    }

    const char *version_sql = "SELECT version FROM schema_version LIMIT 1";
    rc = sqlite3_prepare_v2(db, version_sql, -1, &stmt, NULL);
    if (rc != SQLITE_OK) {
        return -1;
    }

    rc = sqlite3_step(stmt);
    if (rc == SQLITE_ROW) {
        version = sqlite3_column_int(stmt, 0);
    }
    sqlite3_finalize(stmt);

    return version;
}

static int set_schema_version(int version) {
    sqlite3_stmt *stmt;

    const char *upsert_sql = "INSERT OR REPLACE INTO schema_version (rowid, version) VALUES (1, ?)";
    int rc = sqlite3_prepare_v2(db, upsert_sql, -1, &stmt, NULL);
    if (rc != SQLITE_OK) {
        fprintf(stderr, "Failed to prepare schema version upsert: %s\n", sqlite3_errmsg(db));
        return 0;
    }

    sqlite3_bind_int(stmt, 1, version);
    rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);

    if (rc != SQLITE_DONE) {
        fprintf(stderr, "Failed to set schema version: %s\n", sqlite3_errmsg(db));
        return 0;
    }

    return 1;
}

static int run_migrations(int current_version) {
    /*
     * Future migrations should be added here.
     * Each migration block should:
     * 1. Check if current_version < target_version
     * 2. Execute the migration SQL
     * 3. Update the schema version with set_schema_version()
     *
     * Example for version 2:
     *
     * if (current_version < 2) {
     *     const char *migration_sql = "ALTER TABLE zako ADD COLUMN new_field TEXT";
     *     char *err_msg = NULL;
     *     int rc = sqlite3_exec(db, migration_sql, NULL, NULL, &err_msg);
     *     if (rc != SQLITE_OK) {
     *         fprintf(stderr, "Migration to version 2 failed: %s\n", err_msg);
     *         sqlite3_free(err_msg);
     *         return 0;
     *     }
     *     current_version = 2;
     * }
     */

    (void)current_version;

    /* Ensure schema version is up to date after all migrations */
    return set_schema_version(CURRENT_SCHEMA_VERSION);
}

int init_database(const char *db_path) {
    if (db != NULL) return 1;

    int rc = sqlite3_open(db_path, &db);
    if (rc != SQLITE_OK) {
        fprintf(stderr, "Failed to open database: %s\n", sqlite3_errmsg(db));
        return 0;
    }

    sqlite3_busy_timeout(db, 5000);

    const char *sql =
        "CREATE TABLE IF NOT EXISTS zako("
        "id INTEGER PRIMARY KEY AUTOINCREMENT, "
        "tag INTEGER NOT NULL, "
        "status INTEGER NOT NULL, "
        "name TEXT NOT NULL, "
        "detail TEXT NOT NULL, "
        "discord TEXT NOT NULL)";

    char *err_msg = NULL;
    rc = sqlite3_exec(db, sql, NULL, NULL, &err_msg);
    if (rc != SQLITE_OK) {
        fprintf(stderr, "Failed to create table: %s\n", err_msg);
        sqlite3_free(err_msg);
        return 0;
    }

    int current_version = get_schema_version();
    if (current_version < 0) {
        fprintf(stderr, "Failed to get schema version\n");
        return 0;
    }

    if (current_version == 0) {
        const char *schema_version_sql =
            "CREATE TABLE IF NOT EXISTS schema_version("
            "version INTEGER NOT NULL)";

        rc = sqlite3_exec(db, schema_version_sql, NULL, NULL, &err_msg);
        if (rc != SQLITE_OK) {
            fprintf(stderr, "Failed to create schema_version table: %s\n", err_msg);
            sqlite3_free(err_msg);
            return 0;
        }

        if (!set_schema_version(CURRENT_SCHEMA_VERSION)) {
            return 0;
        }
        current_version = CURRENT_SCHEMA_VERSION;
    }

    if (current_version < CURRENT_SCHEMA_VERSION) {
        if (!run_migrations(current_version)) {
            return 0;
        }
    }

    return 1;
}

sqlite3* get_database() {
    return db;
}

void close_database() {
    if (db != NULL) {
        sqlite3_close(db);
        db = NULL;
    }
}
