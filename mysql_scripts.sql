#Show rows from same table
SELECT id FROM table_name WHERE duplicate_column IN ( SELECT duplicate_column FROM table_name GROUP BY duplicate_column HAVING COUNT(*) > 1) ORDER BY duplicate_column DESC;

#Duplicate delete where location_id and datetime defines the uniqueness of a row
ALTER IGNORE TABLE table_name ADD UNIQUE (location_id, datetime)

#Check db size in MB
SELECT table_schema "db_name", ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) "DB Size in MB" FROM information_schema.tables GROUP BY table_schema;
