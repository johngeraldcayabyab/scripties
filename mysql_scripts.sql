#Show rows from same table
SELECT id FROM table_name WHERE duplicate_column IN ( SELECT duplicate_column FROM table_name GROUP BY duplicate_column HAVING COUNT(*) > 1) ORDER BY duplicate_column DESC;
