#Show rows from same table
SELECT id FROM table_name WHERE duplicate_column IN ( SELECT duplicate_column FROM table_name GROUP BY duplicate_column HAVING COUNT(*) > 1) ORDER BY duplicate_column DESC;

#Duplicate delete where location_id and datetime defines the uniqueness of a row
ALTER IGNORE TABLE table_name ADD UNIQUE (location_id, datetime)
